/**
 * Provider contracts.
 *
 * The whole point of this layer: no route, and certainly no component, knows
 * which company answered. Swapping Gemini for a local Ollama model must not
 * touch a single line of UI code.
 *
 * Providers expose exactly one primitive — "given a system prompt, a user prompt,
 * an optional image and a schema, return JSON matching it". Task-specific logic
 * (crop diagnosis, weather advisory, soil, voice) lives in the registry, so
 * adding a task does not mean editing every provider.
 */

import type { Provenance } from '../../shared/types.ts';

/**
 * Schema in Gemini's OpenAPI-subset dialect, which is the narrowest of the three
 * we target. Providers adapt it: OpenAI-compatible endpoints need
 * `additionalProperties`, and `propertyOrdering` is Gemini-only.
 */
export type SchemaObject = Record<string, unknown>;

export interface GenerateRequest {
  /** Stable identifier for the task, e.g. 'crop_diagnosis'. */
  task: string;
  system: string;
  prompt: string;
  /** Base64 data URL. Only sent to providers declaring vision support. */
  image?: string;
  /**
   * Base64 audio data URL. Only sent to providers declaring audio support, which
   * is what lets Gemini act as a speech fallback when Sarvam credit runs out.
   */
  audio?: string;
  schema: SchemaObject;
  /** Hint for providers that cap output length. */
  maxOutputTokens?: number;
}

export interface GenerateResult {
  /** Parsed JSON. Still untrusted — the registry validates it with zod. */
  json: unknown;
  model: string;
}

export interface IntelligenceProvider {
  readonly id: string;
  readonly label: string;
  readonly capabilities: { vision: boolean; audio: boolean; structuredJson: boolean };

  /**
   * Per-provider deadline. Measured, not guessed: Gemini Flash answers in ~3s,
   * free OpenRouter models took 24s, and a local Ollama model on modest hardware
   * is slower still. A single shared timeout either kills a working fallback or
   * makes the primary feel broken.
   */
  readonly timeoutMs: number;

  /** False when no key/model is configured — skipped without a network call. */
  isConfigured(): boolean;

  generate(request: GenerateRequest, signal: AbortSignal): Promise<GenerateResult>;
}

/** Thrown by providers to tell the registry how to react. */
export class ProviderError extends Error {
  readonly kind:
    | 'quota' //        daily allowance gone — demote for the rest of the day
    | 'rate_limited' // per-minute throttle — demote this request only
    | 'unavailable' //  network/5xx/timeout — try the next provider
    | 'invalid_output' // unparseable — one repair retry, then demote
    | 'unsupported' //  provider cannot do this modality at all
    | 'bad_request'; // our fault — do not retry elsewhere blindly

  readonly providerId: string;

  constructor(
    providerId: string,
    kind: ProviderError['kind'],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'ProviderError';
    this.providerId = providerId;
    this.kind = kind;
  }
}

export function provenanceOf(
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

/** Converts the Gemini-dialect schema to standard JSON Schema. */
export function toJsonSchema(schema: SchemaObject): Record<string, unknown> {
  const { propertyOrdering: _ordering, ...rest } = schema;
  return { ...structuredClone(rest), additionalProperties: false };
}

/** Models wrap JSON in fences or prose even when told not to. */
export function extractJsonObject(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  if (cleaned.startsWith('{')) return cleaned;
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}
