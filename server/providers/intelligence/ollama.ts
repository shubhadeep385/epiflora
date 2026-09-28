/**
 * Ollama — fully local fallback. No key, no quota, no network dependency.
 *
 * Prioritizes Google Gemma 4 models (e.g. gemma4:latest, gemma4:27b, gemma4:9b, gemma2).
 * If OLLAMA_MODEL is explicitly set in .env, that model is used.
 * Otherwise, the provider queries /api/tags at startup/runtime to discover and select
 * the best available local Google Gemma model.
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

interface OllamaChatResponse {
  message?: { content?: string };
  error?: string;
}

const PREFERRED_GEMMA_MODELS = [
  'gemma4:latest',
  'gemma4',
  'gemma4:27b',
  'gemma4:9b',
  'gemma4:e4b',
  'gemma2:latest',
  'gemma2:9b',
  'gemma2:27b',
  'gemma2:2b',
  'gemma:latest',
  'gemma:7b',
  'gemma:2b',
];

let cachedModel: { name: string; expiresAt: number } | null = null;

/** Discovers installed Ollama models, prioritizing Google Gemma 4. */
async function resolveLocalModel(signal: AbortSignal): Promise<string> {
  const configured = env.intelligence.ollamaModel;
  if (configured) return configured;

  if (cachedModel && cachedModel.expiresAt > Date.now()) {
    return cachedModel.name;
  }

  const base = env.intelligence.ollamaBaseUrl;
  try {
    const response = await fetch(new URL('/api/tags', base), { signal });
    if (response.ok) {
      const body = (await response.json()) as { models?: Array<{ name: string }> };
      const installed = new Set((body.models ?? []).map((m) => m.name.toLowerCase()));

      for (const pref of PREFERRED_GEMMA_MODELS) {
        if (installed.has(pref.toLowerCase()) || Array.from(installed).some((m) => m.startsWith(pref.toLowerCase()))) {
          const match = Array.from(installed).find((m) => m === pref.toLowerCase() || m.startsWith(pref.toLowerCase())) ?? pref;
          log.info('selected local Google Gemma model for Ollama', { model: match });
          cachedModel = { name: match, expiresAt: Date.now() + 5 * 60 * 1000 };
          return match;
        }
      }

      if (body.models && body.models.length > 0 && body.models[0]?.name) {
        const fallbackModel = body.models[0].name;
        cachedModel = { name: fallbackModel, expiresAt: Date.now() + 5 * 60 * 1000 };
        return fallbackModel;
      }
    }
  } catch {
    // If Ollama is down, fall back to default gemma4
  }

  return 'gemma4:latest';
}

/** Ollama wants bare base64, not a data URL. */
function bareBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
}

export class OllamaProvider implements IntelligenceProvider {
  readonly id = 'ollama';
  readonly capabilities = { vision: true, audio: false, structuredJson: true };

  /** Timeout tailored for local CPU (15s) vs serverless probe (5s). */
  get timeoutMs(): number {
    return process.env.VERCEL === '1' ? 5_000 : 15_000;
  }

  get label(): string {
    const model = env.intelligence.ollamaModel || cachedModel?.name || 'gemma4';
    return `Ollama Google (${model})`.trim();
  }

  isConfigured(): boolean {
    return Boolean(env.intelligence.ollamaBaseUrl);
  }

  async generate(request: GenerateRequest, signal: AbortSignal): Promise<GenerateResult> {
    if (request.audio) {
      throw new ProviderError('ollama', 'unsupported', 'Local vision models here do not accept audio');
    }

    const model = await resolveLocalModel(signal);

    let response: Response;
    try {
      response = await fetch(new URL('/api/chat', env.intelligence.ollamaBaseUrl), {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: false,
          format: toJsonSchema(request.schema),
          messages: [
            { role: 'system', content: request.system },
            {
              role: 'user',
              content: request.prompt,
              ...(request.image ? { images: [bareBase64(request.image)] } : {}),
            },
          ],
        }),
      });
    } catch (cause) {
      throw new ProviderError('ollama', 'unavailable', `Ollama unreachable: ${String(cause)}`, {
        cause,
      });
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new ProviderError(
        'ollama',
        'unavailable',
        `Ollama error ${response.status}: ${detail.slice(0, 160)}`,
      );
    }

    const body = (await response.json()) as OllamaChatResponse;
    const text = body.message?.content?.trim();

    if (!text) {
      throw new ProviderError('ollama', 'invalid_output', body.error ?? 'Empty response from Ollama');
    }

    try {
      return { json: JSON.parse(extractJsonObject(text)), model };
    } catch (cause) {
      throw new ProviderError('ollama', 'invalid_output', 'Unparseable local model output', {
        cause,
      });
    }
  }
}
