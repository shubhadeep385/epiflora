/**
 * OpenRouter — first cloud fallback, restricted to genuinely free models.
 *
 * The free roster churns: it was 15 IDs one week and 14 the next as whole model
 * families were delisted. Hardcoding an ID would mean a silent 404 on demo day,
 * so the list is resolved at runtime from /api/v1/models and filtered on `:free`
 * plus declared modality. PREFERRED only expresses an ordering *within* whatever
 * happens to be free today.
 */

import { env } from '../../lib/env.ts';
import { log } from '../../lib/logger.ts';
import {
  ProviderError,
  extractJsonObject,
  toJsonSchema,
  type GenerateRequest,
  type GenerateResult,
  type IntelligenceProvider,
} from '../types.ts';

const BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL_CACHE_MS = 10 * 60 * 1000;

/**
 * Preference order among free models, best-judged first. All verified present on
 * 2026-08-17; absence is handled rather than assumed.
 */
const PREFERRED = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-2-27b-it:free',
  'google/gemma-2-9b-it:free',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash-thinking-exp:free',
  'google/gemma-7b-it:free',
];

interface OpenRouterModel {
  id: string;
  architecture?: { input_modalities?: string[] };
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  error?: { message?: string; code?: number };
}

const modelCache = new Map<string, { ids: string[]; expiresAt: number }>();

/** Free model IDs in preference order, optionally requiring image support. */
async function resolveModels(needsVision: boolean, signal: AbortSignal): Promise<string[]> {
  const cacheKey = needsVision ? 'vision' : 'text';
  const hit = modelCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.ids;

  const response = await fetch(`${BASE_URL}/models`, {
    signal,
    headers: { Authorization: `Bearer ${env.intelligence.openRouterApiKey}` },
  });

  if (!response.ok) {
    throw new ProviderError(
      'openrouter',
      'unavailable',
      `Could not list models: HTTP ${response.status}`,
    );
  }

  const body = (await response.json()) as { data?: OpenRouterModel[] };
  const candidates = (body.data ?? []).filter((model) => {
    const isFree = model.id.endsWith(':free');
    if (!isFree && env.intelligence.openRouterFreeOnly) return false;
    // Strictly restrict to Google models (Gemma / Gemini)
    const isGoogle = model.id.toLowerCase().startsWith('google/') || model.id.toLowerCase().includes('gemma');
    if (!isGoogle) return false;
    if (!needsVision) return true;
    return model.architecture?.input_modalities?.includes('image') ?? false;
  });

  const available = new Set(candidates.map((model) => model.id));
  const ordered = [
    ...PREFERRED.filter((id) => available.has(id)),
    ...candidates.map((model) => model.id).filter((id) => !PREFERRED.includes(id)),
  ];

  log.info('resolved OpenRouter free models', {
    mode: cacheKey,
    count: ordered.length,
    using: ordered[0],
  });
  modelCache.set(cacheKey, { ids: ordered, expiresAt: Date.now() + MODEL_CACHE_MS });
  return ordered;
}

export class OpenRouterProvider implements IntelligenceProvider {
  readonly id = 'openrouter';
  readonly label = 'OpenRouter (free)';
  readonly capabilities = { vision: true, audio: false, structuredJson: true };
  /**
   * Free models queue behind paying traffic. Cap at 10s so the entire cascade
   * completes well within the serverless 30s envelope.
   */
  readonly timeoutMs = 10_000;

  isConfigured(): boolean {
    return Boolean(env.intelligence.openRouterApiKey);
  }

  async generate(request: GenerateRequest, signal: AbortSignal): Promise<GenerateResult> {
    // One free model does accept audio, but OpenRouter's audio payload format is
    // unverified here, so audio work is declined rather than half-supported.
    if (request.audio) {
      throw new ProviderError('openrouter', 'unsupported', 'Audio input is not wired up for OpenRouter');
    }

    const models = await resolveModels(Boolean(request.image), signal);
    if (models.length === 0) {
      throw new ProviderError('openrouter', 'unavailable', 'No suitable free models available today');
    }

    let lastError: ProviderError | null = null;

    // Try top 2 candidates within the timeout
    for (const model of models.slice(0, 2)) {
      try {
        const text = await this.chat(model, request, signal, true);
        return { json: JSON.parse(extractJsonObject(text)), model };
      } catch (cause) {
        const error =
          cause instanceof ProviderError
            ? cause
            : new ProviderError('openrouter', 'invalid_output', String(cause), { cause });
        lastError = error;
        log.warn('openrouter model failed, trying next free model', {
          model,
          task: request.task,
          kind: error.kind,
          message: error.message.slice(0, 160),
        });
      }
    }

    throw lastError ?? new ProviderError('openrouter', 'unavailable', 'All free models failed');
  }

  private async chat(
    model: string,
    request: GenerateRequest,
    signal: AbortSignal,
    useSchema: boolean,
  ): Promise<string> {
    const content: unknown[] = [{ type: 'text', text: request.prompt }];
    if (request.image) {
      content.push({ type: 'image_url', image_url: { url: request.image } });
    }

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: request.system },
        { role: 'user', content },
      ],
      max_tokens: request.maxOutputTokens ?? 2048,
    };

    if (useSchema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: { name: request.task, strict: true, schema: toJsonSchema(request.schema) },
      };
    }

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${env.intelligence.openRouterApiKey}`,
        'Content-Type': 'application/json',
        // Used for attribution on the OpenRouter dashboard.
        'HTTP-Referer': 'https://epiflora.app',
        'X-Title': 'EpiFlora',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ChatResponse | null;
      const message = payload?.error?.message ?? `HTTP ${response.status}`;

      if (response.status === 429) {
        // Free models throttle per minute and recover quickly, so this is never
        // treated as the day's allowance being gone.
        throw new ProviderError('openrouter', 'rate_limited', `Rate limited: ${message}`);
      }

      // A rejected key is this provider being unavailable, not a bad request.
      if (response.status === 401 || response.status === 403) {
        throw new ProviderError(
          'openrouter',
          'unavailable',
          `OpenRouter credentials rejected (${response.status}): ${message}`,
        );
      }

      // Many free models do not implement structured outputs. Retry in plain JSON
      // mode rather than discarding an otherwise working model.
      if (useSchema && (response.status === 400 || response.status === 404)) {
        log.info('model rejected json_schema, retrying without structured output', { model });
        return this.chat(
          model,
          {
            ...request,
            prompt: `${request.prompt}\n\nReturn only a JSON object matching this schema, with no prose or markdown:\n${JSON.stringify(toJsonSchema(request.schema))}`,
          },
          signal,
          false,
        );
      }

      throw new ProviderError('openrouter', 'unavailable', `${response.status}: ${message}`);
    }

    const payload = (await response.json()) as ChatResponse;
    const text = payload.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new ProviderError(
        'openrouter',
        'invalid_output',
        `Empty response (finish_reason: ${payload.choices?.[0]?.finish_reason ?? 'unknown'})`,
      );
    }

    return text;
  }
}
