/**
 * Speech and text-to-speech contracts.
 *
 * Kept separate from the intelligence layer on purpose — this is the product
 * thesis expressed as code. Gemini supplies the agricultural reasoning; Sarvam
 * makes it reachable in the farmer's language. Either side can be swapped without
 * touching the other, and the Voice UI knows about neither.
 */

import type { Provenance } from '../../../shared/types.ts';

export interface AudioInput {
  /**
   * Raw audio bytes. Explicitly ArrayBuffer-backed so it satisfies BlobPart when
   * forwarded as multipart to Sarvam.
   */
  bytes: Uint8Array<ArrayBuffer>;
  /** e.g. 'audio/webm', 'audio/wav'. Sarvam auto-detects from the file. */
  mimeType: string;
  filename: string;
}

export interface TranscriptResult {
  text: string;
  /** BCP-47. */
  language: string;
  /** Null when the language was supplied rather than detected. */
  languageProbability: number | null;
  model: string;
}

export interface SpeechProvider {
  readonly id: string;
  readonly label: string;
  readonly timeoutMs: number;
  isConfigured(): boolean;
  /**
   * @param language BCP-47 tag, or undefined to let the provider auto-detect.
   */
  transcribe(audio: AudioInput, language: string | undefined, signal: AbortSignal): Promise<TranscriptResult>;
}

export interface SynthesisResult {
  /** Base64-encoded audio, ready to become a data URL. */
  audioBase64: string;
  mimeType: string;
  model: string;
}

export interface TTSProvider {
  readonly id: string;
  readonly label: string;
  readonly timeoutMs: number;
  isConfigured(): boolean;
  /** Returns null when this provider has no voice for the requested language. */
  synthesize(text: string, language: string, signal: AbortSignal): Promise<SynthesisResult | null>;
}

export class VoiceError extends Error {
  readonly kind: 'quota' | 'rate_limited' | 'unavailable' | 'no_speech' | 'too_long' | 'unsupported';
  readonly providerId: string;

  constructor(
    providerId: string,
    kind: VoiceError['kind'],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'VoiceError';
    this.providerId = providerId;
    this.kind = kind;
  }
}

export function voiceProvenance(
  providerId: string,
  model: string,
  startedAt: number,
  degraded: boolean,
): Provenance {
  return {
    provider: providerId,
    model,
    degraded,
    latencyMs: Math.round(performance.now() - startedAt),
  };
}
