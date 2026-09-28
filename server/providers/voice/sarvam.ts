/**
 * Sarvam AI — the language accessibility layer.
 *
 * Saaras v3 for speech recognition, Bulbul v3 for speech output. Verified live on
 * 2026-08-17 by round-tripping Bulbul's own Hindi audio back through Saaras
 * (p=0.99).
 *
 * Documented limits that shape the code, not just the comments:
 *   - Saaras real-time REST rejects audio over 30 seconds. The recorder caps at 25.
 *   - Bulbul accepts 2500 characters per request, so long text is chunked.
 *   - Saaras understands 23 languages; Bulbul speaks 11. Where a language has no
 *     voice, synthesize() returns null and the client falls back to browser speech
 *     rather than silently saying nothing.
 *
 * Sarvam is pay-per-use after a small signup credit, so a spent balance must
 * degrade rather than fail.
 */

import { env } from '../../lib/env.ts';
import { log } from '../../lib/logger.ts';
import {
  VoiceError,
  type AudioInput,
  type SpeechProvider,
  type SynthesisResult,
  type TranscriptResult,
  type TTSProvider,
} from './types.ts';

const BASE_URL = 'https://api.sarvam.ai';

/** Bulbul v3 speaks these. Saaras understands more — see BULBUL note above. */
const BULBUL_LANGUAGES = new Set([
  'en-IN',
  'hi-IN',
  'bn-IN',
  'mr-IN',
  'ta-IN',
  'te-IN',
  'kn-IN',
  'ml-IN',
  'gu-IN',
  'pa-IN',
  'od-IN',
]);

/** Bulbul's documented per-request ceiling. */
const TTS_CHAR_LIMIT = 2500;

function mapHttpError(providerId: string, status: number, body: string): VoiceError {
  if (status === 429) {
    return new VoiceError(providerId, 'rate_limited', `Sarvam rate limited: ${body.slice(0, 140)}`);
  }
  // 402/403 is the shape a spent balance or disabled key takes.
  if (status === 401 || status === 402 || status === 403) {
    return new VoiceError(
      providerId,
      'quota',
      `Sarvam credentials or credit rejected (${status}): ${body.slice(0, 140)}`,
    );
  }
  if (status === 413) {
    return new VoiceError(providerId, 'too_long', 'Audio was too large for Sarvam');
  }
  return new VoiceError(providerId, 'unavailable', `Sarvam error ${status}: ${body.slice(0, 140)}`);
}

interface SaarasResponse {
  transcript?: string;
  language_code?: string | null;
  language_probability?: number | null;
}

export class SarvamSpeechProvider implements SpeechProvider {
  readonly id = 'sarvam-stt';
  readonly timeoutMs = 30_000;

  get label(): string {
    return `Sarvam ${env.voice.sarvamSttModel}`;
  }

  isConfigured(): boolean {
    return Boolean(env.voice.sarvamApiKey);
  }

  async transcribe(
    audio: AudioInput,
    language: string | undefined,
    signal: AbortSignal,
  ): Promise<TranscriptResult> {
    const form = new FormData();
    form.append('file', new Blob([audio.bytes], { type: audio.mimeType }), audio.filename);
    form.append('model', env.voice.sarvamSttModel);
    // codemix keeps "मेरी wheat crop में leaves yellow हो रहे हैं" intact, which is
    // how farmers actually speak and what the reasoning model reads best.
    form.append('mode', env.voice.sarvamSttMode);
    /**
     * Passing an explicit code skips detection and makes language_probability null.
     * 'unknown' asks Saaras to detect, which is right when the farmer has not
     * chosen a language yet.
     */
    form.append('language_code', language ?? 'unknown');

    const response = await fetch(`${BASE_URL}/speech-to-text`, {
      method: 'POST',
      signal,
      headers: { 'api-subscription-key': env.voice.sarvamApiKey },
      body: form,
    });

    const raw = await response.text();
    if (!response.ok) throw mapHttpError(this.id, response.status, raw);

    let body: SaarasResponse;
    try {
      body = JSON.parse(raw) as SaarasResponse;
    } catch (cause) {
      throw new VoiceError(this.id, 'unavailable', 'Sarvam returned a non-JSON response', { cause });
    }

    const text = body.transcript?.trim() ?? '';
    if (text.length === 0) {
      throw new VoiceError(this.id, 'no_speech', 'No speech detected in the recording');
    }

    return {
      text,
      language: body.language_code ?? language ?? 'en-IN',
      languageProbability: body.language_probability ?? null,
      model: env.voice.sarvamSttModel,
    };
  }
}

interface BulbulResponse {
  audios?: string[];
}

/** Concatenates multiple base64-encoded WAV files by combining PCM data and updating RIFF headers. */
function concatWavs(base64Parts: string[]): string {
  if (base64Parts.length <= 1) return base64Parts[0] ?? '';

  const buffers = base64Parts.map((b64) => Buffer.from(b64, 'base64'));
  const first = buffers[0]!;

  // Locate the "data" subchunk in the master header
  let dataOffset = -1;
  for (let i = 12; i < first.length - 8; i++) {
    if (
      first[i] === 0x64 && // 'd'
      first[i + 1] === 0x61 && // 'a'
      first[i + 2] === 0x74 && // 't'
      first[i + 3] === 0x61 // 'a'
    ) {
      dataOffset = i;
      break;
    }
  }

  if (dataOffset === -1) {
    return base64Parts[0]!;
  }

  const header = Buffer.from(first.subarray(0, dataOffset + 8));
  const audioDataParts: Buffer[] = [first.subarray(dataOffset + 8)];

  for (let i = 1; i < buffers.length; i++) {
    const buf = buffers[i]!;
    let subDataOffset = -1;
    for (let j = 12; j < buf.length - 8; j++) {
      if (
        buf[j] === 0x64 &&
        buf[j + 1] === 0x61 &&
        buf[j + 2] === 0x74 &&
        buf[j + 3] === 0x61
      ) {
        subDataOffset = j;
        break;
      }
    }
    if (subDataOffset !== -1) {
      audioDataParts.push(buf.subarray(subDataOffset + 8));
    } else {
      audioDataParts.push(buf);
    }
  }

  const combinedAudio = Buffer.concat(audioDataParts);
  const totalFileSize = header.length + combinedAudio.length - 8;
  const totalDataSize = combinedAudio.length;

  header.writeUInt32LE(totalFileSize, 4);
  header.writeUInt32LE(totalDataSize, dataOffset + 4);

  return Buffer.concat([header, combinedAudio]).toString('base64');
}

export class SarvamTTSProvider implements TTSProvider {
  readonly id = 'sarvam-tts';
  readonly timeoutMs = 30_000;

  get label(): string {
    return `Sarvam ${env.voice.sarvamTtsModel}`;
  }

  isConfigured(): boolean {
    return Boolean(env.voice.sarvamApiKey);
  }

  /** Splits on sentence boundaries so chunk joins do not cut mid-word. */
  private chunk(text: string): string[] {
    if (text.length <= TTS_CHAR_LIMIT) return [text];

    const sentences = text.split(/(?<=[।.!?])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length > TTS_CHAR_LIMIT && current.length > 0) {
        chunks.push(current.trim());
        current = '';
      }
      current += `${sentence} `;
    }
    if (current.trim().length > 0) chunks.push(current.trim());

    return chunks;
  }

  async synthesize(
    text: string,
    language: string,
    signal: AbortSignal,
  ): Promise<SynthesisResult | null> {
    if (!BULBUL_LANGUAGES.has(language)) {
      log.info('no Bulbul voice for this language, deferring to browser speech', { language });
      return null;
    }

    const chunks = this.chunk(text);
    const parts: string[] = [];

    for (const chunk of chunks) {
      const response = await fetch(`${BASE_URL}/text-to-speech`, {
        method: 'POST',
        signal,
        headers: {
          'api-subscription-key': env.voice.sarvamApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chunk,
          target_language_code: language,
          model: env.voice.sarvamTtsModel,
        }),
      });

      const raw = await response.text();
      if (!response.ok) throw mapHttpError(this.id, response.status, raw);

      const body = JSON.parse(raw) as BulbulResponse;
      const audio = body.audios?.[0];
      if (!audio) {
        throw new VoiceError(this.id, 'unavailable', 'Sarvam returned no audio');
      }
      parts.push(audio);
    }

    return {
      audioBase64: concatWavs(parts),
      mimeType: 'audio/wav',
      model: env.voice.sarvamTtsModel,
    };
  }
}
