/**
 * Voice registry — the speech and TTS equivalents of the intelligence chain.
 *
 * Chains:
 *   STT: Sarvam Saaras v3 → Gemini audio → (client-side browser recognition)
 *   TTS: Sarvam Bulbul v3 → (client-side browser speech synthesis)
 *
 * Browser capabilities are the terminal fallback for both, which is why they are
 * not implemented here: the server cannot run them. Instead the response carries a
 * flag telling the client to use its own voice, so "no provider available" still
 * produces a spoken answer rather than an error.
 */

import type { Provenance } from '../../../shared/types.ts';
import { budget } from '../../lib/budget.ts';
import { log } from '../../lib/logger.ts';
import { env } from '../../lib/env.ts';
import { AppError } from '../../lib/http.ts';
import { GeminiSpeechProvider } from './geminiSpeech.ts';
import { SarvamSpeechProvider, SarvamTTSProvider } from './sarvam.ts';
import {
  VoiceError,
  type AudioInput,
  type SpeechProvider,
  type TranscriptResult,
  type TTSProvider,
} from './types.ts';

const SPEECH_CHAIN: SpeechProvider[] = [new SarvamSpeechProvider(), new GeminiSpeechProvider()];
const TTS_CHAIN: TTSProvider[] = [new SarvamTTSProvider()];

export interface TranscribeOutcome {
  transcript: TranscriptResult;
  provenance: Provenance;
}

export interface SynthesizeOutcome {
  /** Null when no server-side voice could produce audio. */
  audio: { dataUrl: string; mimeType: string } | null;
  provenance: Provenance | null;
  /** True when the client should speak the text itself. */
  useBrowserVoice: boolean;
}

export const voice = {
  /** Which providers are configured, for the status pill. */
  status() {
    return {
      speech: SPEECH_CHAIN.filter((p) => p.isConfigured()).map((p) => ({ id: p.id, label: p.label })),
      tts: TTS_CHAIN.filter((p) => p.isConfigured()).map((p) => ({ id: p.id, label: p.label })),
    };
  },

  async transcribe(
    audio: AudioInput,
    language: string | undefined,
  ): Promise<TranscribeOutcome> {
    const usable = SPEECH_CHAIN.filter((provider) => {
      if (!provider.isConfigured()) return false;
      if (!budget.allows(provider.id)) {
        log.info('skipping speech provider: budget reached', { provider: provider.id });
        return false;
      }
      return true;
    });

    if (usable.length === 0) {
      throw new AppError(
        'all_providers_failed',
        'No speech provider is configured — the client should use browser recognition or text input',
      );
    }

    const failures: string[] = [];
    // Measured against the head of the full chain, not the filtered list, so an
    // unconfigured Sarvam cannot make Gemini look like the intended provider.
    const preferred = SPEECH_CHAIN[0]?.id;

    for (const provider of usable) {
      const startedAt = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), provider.timeoutMs);

      try {
        budget.record(provider.id);
        const transcript = await provider.transcribe(audio, language, controller.signal);

        return {
          transcript,
          provenance: {
            provider: provider.id,
            model: transcript.model,
            degraded: provider.id !== preferred,
            latencyMs: Math.round(performance.now() - startedAt),
          },
        };
      } catch (cause) {
        const error =
          cause instanceof VoiceError
            ? cause
            : new VoiceError(provider.id, 'unavailable', String(cause), { cause });

        /**
         * Silence is not a provider failure. Trying three more providers on an
         * empty recording wastes quota and still cannot invent speech, so this
         * surfaces immediately as something the farmer can fix.
         */
        if (error.kind === 'no_speech') {
          throw new AppError('invalid_request', 'No speech was detected in the recording', {
            cause: error,
          });
        }

        if (error.kind === 'too_long') {
          throw new AppError('audio_too_long', error.message, { cause: error });
        }

        if (error.kind === 'quota') budget.markExhausted(provider.id);

        failures.push(`${provider.id}: ${error.kind}`);
        log.warn('speech provider failed, demoting', {
          provider: provider.id,
          kind: error.kind,
          message: error.message.slice(0, 200),
        });
      } finally {
        clearTimeout(timer);
      }
    }

    throw new AppError('all_providers_failed', `Speech recognition failed (${failures.join('; ')})`);
  },

  /**
   * Never throws. Speech output is an enhancement — the text answer is always
   * shown — so any failure degrades to the browser voice instead of losing the
   * answer the farmer already waited for.
   */
  async synthesize(text: string, language: string): Promise<SynthesizeOutcome> {
    const preferred = TTS_CHAIN[0]?.id;

    for (const provider of TTS_CHAIN) {
      if (!provider.isConfigured() || !budget.allows(provider.id)) continue;

      const startedAt = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), provider.timeoutMs);

      try {
        budget.record(provider.id);
        const result = await provider.synthesize(text, language, controller.signal);

        // null means this provider has no voice for the language, not a failure.
        if (!result) break;

        return {
          audio: {
            dataUrl: `data:${result.mimeType};base64,${result.audioBase64}`,
            mimeType: result.mimeType,
          },
          provenance: {
            provider: provider.id,
            model: result.model,
            degraded: provider.id !== preferred,
            latencyMs: Math.round(performance.now() - startedAt),
          },
          useBrowserVoice: false,
        };
      } catch (cause) {
        const error =
          cause instanceof VoiceError
            ? cause
            : new VoiceError(provider.id, 'unavailable', String(cause), { cause });

        if (error.kind === 'quota') budget.markExhausted(provider.id);

        log.warn('tts provider failed, falling back to browser voice', {
          provider: provider.id,
          kind: error.kind,
          message: error.message.slice(0, 200),
        });
      } finally {
        clearTimeout(timer);
      }
    }

    return { audio: null, provenance: null, useBrowserVoice: true };
  },

  /** True when Sarvam is the configured primary, for honest UI labelling. */
  isSarvamPrimary(): boolean {
    return env.voice.provider === 'sarvam' && Boolean(env.voice.sarvamApiKey);
  },
};
