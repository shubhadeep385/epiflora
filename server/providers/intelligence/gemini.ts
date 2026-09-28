/**
 * Gemini via the REST API.
 *
 * Deliberately no SDK: every other provider here is plain fetch, so keeping this
 * one uniform makes the layer easier to reason about and removes a dependency
 * whose generated types churn between releases.
 *
 * Gemini 3.x specifics that break code copied from older tutorials, all verified
 * against the live API on 2026-08-17:
 *   - temperature / topP / topK / candidateCount are rejected outright.
 *   - thinkingBudget is gone; thinkingLevel replaces it and must be nested under
 *     generationConfig.thinkingConfig. A flat thinkingLevel is rejected.
 *
 * Because that surface keeps moving, an INVALID_ARGUMENT naming a field we sent
 * triggers one retry with that field dropped rather than a hard failure.
 */

import { env } from '../../lib/env.ts';
import { log } from '../../lib/logger.ts';
import {
  ProviderError,
  extractJsonObject,
  type GenerateRequest,
  type GenerateResult,
  type IntelligenceProvider,
} from '../types.ts';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/** generationConfig keys we may send, and therefore may be asked to drop. */
const OPTIONAL_CONFIG_KEYS = ['thinkingConfig', 'responseSchema', 'responseMimeType'] as const;

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
}

/** Splits a data URL into the mime type and bare base64 Gemini expects. */
function decodeDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match?.[1] || !match[2]) {
    throw new ProviderError('gemini', 'bad_request', 'Image is not a base64 data URL');
  }
  return { mimeType: match[1], data: match[2] };
}

export class GeminiProvider implements IntelligenceProvider {
  readonly id = 'gemini';
  readonly capabilities = { vision: true, audio: true, structuredJson: true };
  /** Fast cloud model; 12s covers latency plus repair retry without starving downstream fallbacks. */
  readonly timeoutMs = 12_000;

  get label(): string {
    const model = env.intelligence.geminiModels[0] ?? 'gemini';
    return `Gemini ${model.replace(/^gemini-/, '')}`;
  }

  isConfigured(): boolean {
    return Boolean(env.intelligence.geminiApiKey);
  }

  async generate(request: GenerateRequest, signal: AbortSignal): Promise<GenerateResult> {
    const parts: GeminiPart[] = [{ text: request.prompt }];
    if (request.image) parts.push({ inlineData: decodeDataUrl(request.image) });
    // Gemini accepts audio inline, which makes it a usable speech fallback.
    if (request.audio) parts.push({ inlineData: decodeDataUrl(request.audio) });

    // Walk the model preference list: a per-model limit should demote to the next
    // Gemini model before abandoning Gemini altogether.
    let lastError: ProviderError | null = null;

    for (const model of env.intelligence.geminiModels) {
      try {
        const text = await this.call(model, request, parts, signal);
        return { json: JSON.parse(extractJsonObject(text)), model };
      } catch (cause) {
        const error =
          cause instanceof ProviderError
            ? cause
            : new ProviderError('gemini', 'invalid_output', String(cause), { cause });

        // Our own bug — trying another model will not help.
        if (error.kind === 'bad_request') throw error;

        lastError = error;
        log.warn('gemini model failed, trying next in chain', {
          model,
          task: request.task,
          kind: error.kind,
          message: error.message.slice(0, 160),
        });
      }
    }

    throw lastError ?? new ProviderError('gemini', 'unavailable', 'No Gemini models configured');
  }

  private async call(
    model: string,
    request: GenerateRequest,
    parts: GeminiPart[],
    signal: AbortSignal,
    droppedKeys: string[] = [],
  ): Promise<string> {
    const generationConfig: Record<string, unknown> = {
      responseMimeType: 'application/json',
      responseSchema: request.schema,
      // Verified by probe: generateContent wants this nested. A flat thinkingLevel
      // is rejected, and getting it wrong cost a wasted request on every call.
      thinkingConfig: { thinkingLevel: env.intelligence.geminiThinkingLevel },
      ...(request.maxOutputTokens ? { maxOutputTokens: request.maxOutputTokens } : {}),
    };
    for (const key of droppedKeys) delete generationConfig[key];

    const response = await fetch(`${BASE_URL}/models/${model}:generateContent`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.intelligence.geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.system }] },
        contents: [{ role: 'user', parts }],
        generationConfig,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as GeminiResponse | null;
      const message = body?.error?.message ?? `HTTP ${response.status}`;

      if (response.status === 429) {
        // A per-minute throttle must not retire Gemini for the whole day.
        const daily = /per\s*day|PerDay|daily/i.test(message);
        throw new ProviderError(
          'gemini',
          daily ? 'quota' : 'rate_limited',
          `Gemini ${daily ? 'daily quota exhausted' : 'rate limited'}: ${message}`,
        );
      }

      /**
       * Auth and permission failures must NOT be classified as bad_request.
       *
       * Google returns HTTP 400 with API_KEY_INVALID for a revoked, expired or
       * mistyped key. Treating that as our own malformed payload made the registry
       * abort the whole request instead of falling through — so one bad key took
       * the entire app down, which is the exact scenario the chain exists for.
       * A credential problem is this provider being unavailable, nothing more.
       */
      const authFailure =
        response.status === 401 ||
        response.status === 403 ||
        /api[\s_-]?key|unauthenticated|permission[\s_-]?denied|credential/i.test(message);

      if (authFailure) {
        throw new ProviderError(
          'gemini',
          'unavailable',
          `Gemini credentials rejected (${response.status}): ${message}`,
        );
      }

      if (response.status === 400) {
        // Self-heal: if the API named an optional field we sent, drop it and retry.
        const offending = OPTIONAL_CONFIG_KEYS.find(
          (key) => !droppedKeys.includes(key) && message.toLowerCase().includes(key.toLowerCase()),
        );
        if (offending) {
          log.warn('gemini rejected a generationConfig field, retrying without it', {
            model,
            field: offending,
          });
          return this.call(model, request, parts, signal, [...droppedKeys, offending]);
        }
        throw new ProviderError('gemini', 'bad_request', `Gemini rejected the request: ${message}`);
      }

      throw new ProviderError('gemini', 'unavailable', `Gemini error ${response.status}: ${message}`);
    }

    const body = (await response.json()) as GeminiResponse;

    if (body.promptFeedback?.blockReason) {
      throw new ProviderError(
        'gemini',
        'invalid_output',
        `Response blocked: ${body.promptFeedback.blockReason}`,
      );
    }

    const text = (body.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      throw new ProviderError(
        'gemini',
        'invalid_output',
        `Empty response (finishReason: ${body.candidates?.[0]?.finishReason ?? 'unknown'})`,
      );
    }

    return text;
  }
}
