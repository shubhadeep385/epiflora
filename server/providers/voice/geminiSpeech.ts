/**
 * Gemini as a speech-to-text fallback.
 *
 * Worth having because Sarvam is pay-per-use: when its credit runs out, the voice
 * feature must keep working rather than falling back to typing. Gemini accepts
 * audio inline and already has a working key in this deployment, so it costs
 * nothing extra to wire up.
 *
 * Quality caveat: Sarvam is purpose-built for Indic and code-mixed speech and
 * stays the primary. This is the safety net, not an equal alternative.
 */

import { env } from '../../lib/env.ts';
import { GEMINI_TRANSCRIPT_SCHEMA, transcriptSchema } from '../../schemas/answer.ts';
import { TRANSCRIPTION_SYSTEM_PROMPT, languageName } from '../../prompts/agronomist.ts';
import { GeminiProvider } from '../intelligence/gemini.ts';
import { ProviderError } from '../types.ts';
import { VoiceError, type AudioInput, type SpeechProvider, type TranscriptResult } from './types.ts';

/** Reuses the intelligence provider so the model chain and self-healing apply. */
const gemini = new GeminiProvider();

function toDataUrl(audio: AudioInput): string {
  const base64 = Buffer.from(audio.bytes).toString('base64');
  return `data:${audio.mimeType};base64,${base64}`;
}

export class GeminiSpeechProvider implements SpeechProvider {
  readonly id = 'gemini-stt';
  readonly timeoutMs = 30_000;

  get label(): string {
    return 'Gemini audio';
  }

  isConfigured(): boolean {
    return Boolean(env.intelligence.geminiApiKey);
  }

  async transcribe(
    audio: AudioInput,
    language: string | undefined,
    signal: AbortSignal,
  ): Promise<TranscriptResult> {
    const languageHint = language
      ? `The speaker is most likely speaking ${languageName(language)}.`
      : 'The speaker may be using any Indian language, or a mix with English.';

    try {
      const result = await gemini.generate(
        {
          task: 'transcription',
          system: TRANSCRIPTION_SYSTEM_PROMPT,
          prompt: `Transcribe the attached recording. ${languageHint}`,
          audio: toDataUrl(audio),
          schema: GEMINI_TRANSCRIPT_SCHEMA as unknown as Record<string, unknown>,
          maxOutputTokens: 1024,
        },
        signal,
      );

      const parsed = transcriptSchema.parse(result.json);
      if (parsed.transcript.length === 0) {
        throw new VoiceError(this.id, 'no_speech', 'No speech detected in the recording');
      }

      return {
        text: parsed.transcript,
        language: language ?? parsed.languageCode,
        languageProbability: language ? null : parsed.confidence,
        model: result.model,
      };
    } catch (cause) {
      if (cause instanceof VoiceError) throw cause;

      // Translate intelligence-layer failures into voice-layer vocabulary so the
      // voice registry can make its own demotion decisions.
      if (cause instanceof ProviderError) {
        const kind =
          cause.kind === 'quota'
            ? 'quota'
            : cause.kind === 'rate_limited'
              ? 'rate_limited'
              : 'unavailable';
        throw new VoiceError(this.id, kind, cause.message, { cause });
      }

      throw new VoiceError(this.id, 'unavailable', String(cause), { cause });
    }
  }
}
