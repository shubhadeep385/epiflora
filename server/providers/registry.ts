/**
 * Provider registry — where the fallback chain actually happens.
 *
 * Order comes from AI_PROVIDER_CHAIN and always ends at Demo Mode. A provider is
 * skipped without a network call when it is unconfigured or out of budget, so we
 * never spend a request discovering something we already knew.
 *
 * Task logic lives here rather than in the providers, so adding a capability means
 * writing one function, not editing four provider files.
 */

import type {
  Advisory,
  CropDiagnosis,
  IntelligenceProviderId,
  Provenance,
  SoilRecommendation,
  WeatherSnapshot,
} from '../../shared/types.ts';
import { budget } from '../lib/budget.ts';
import { cached, cacheKey } from '../lib/cache.ts';
import { AppError } from '../lib/http.ts';
import { log } from '../lib/logger.ts';
import { env } from '../lib/env.ts';
import { parseCropDiagnosis, GEMINI_DIAGNOSIS_SCHEMA, type DiagnoseRequest } from '../schemas/diagnosis.ts';
import {
  parseAdvisoryModel,
  ADVISORY_DISCLAIMER,
  GEMINI_ADVISORY_SCHEMA,
} from '../schemas/advisory.ts';
import { parseAgriAnswer, GEMINI_ANSWER_SCHEMA, type AgriAnswerOutput } from '../schemas/answer.ts';
import {
  assessSoil,
  GEMINI_SOIL_SCHEMA,
  parseSoilRecommendation,
  SOIL_DISCLAIMER,
  type SoilRequest,
} from '../schemas/soil.ts';
import {
  AGRONOMIST_SYSTEM_PROMPT,
  buildAdvisoryPrompt,
  buildDiagnosisPrompt,
  buildSoilPrompt,
  buildVoiceAnswerPrompt,
  type VoiceContext,
} from '../prompts/agronomist.ts';
import { assessRisk } from '../services/weather.ts';
import { DemoProvider } from './intelligence/demo.ts';
import { GeminiProvider } from './intelligence/gemini.ts';
import { OllamaProvider } from './intelligence/ollama.ts';
import { OpenRouterProvider } from './intelligence/openrouter.ts';
import { ProviderError, type GenerateRequest, type IntelligenceProvider } from './types.ts';

const REGISTRY: Partial<Record<IntelligenceProviderId, IntelligenceProvider>> = {
  gemini: new GeminiProvider(),
  openrouter: new OpenRouterProvider(),
  ollama: new OllamaProvider(),
  demo: new DemoProvider(),
  // huggingface stays unregistered until a free allowance is worth the code.
};

/**
 * The provider we would prefer to answer, regardless of whether it can today.
 *
 * `degraded` is measured against this rather than against the filtered list.
 * Otherwise an unconfigured Gemini would make OpenRouter the head of the usable
 * chain and report itself as primary, hiding from the status pill that the
 * preferred intelligence is not in play.
 */
function preferredProviderId(): string | undefined {
  for (const id of env.intelligence.chain) {
    if (REGISTRY[id]) return id;
  }
  return undefined;
}

/** Providers in configured order that could actually answer right now. */
function usableChain(needsVision: boolean): IntelligenceProvider[] {
  // DEMO_MODE=true forces seeded output: useful for offline rehearsal.
  if (env.demoMode) {
    const demo = REGISTRY.demo;
    return demo ? [demo] : [];
  }

  const chain: IntelligenceProvider[] = [];

  for (const id of env.intelligence.chain) {
    const provider = REGISTRY[id];
    if (!provider) continue;
    if (needsVision && !provider.capabilities.vision) continue;
    if (!provider.isConfigured()) continue;
    if (!budget.allows(provider.id)) {
      log.info('skipping provider: daily budget reached', { provider: provider.id });
      continue;
    }
    chain.push(provider);
  }

  return chain;
}

interface RunResult<T> {
  data: T;
  provenance: Provenance;
}

const GLOBAL_BUDGET_MS = 26_000;

/**
 * Runs a task down the chain until one provider returns output that validates.
 *
 * `parse` is applied inside the loop on purpose: output that cannot be validated
 * is a provider failure, not a request failure, so the next provider gets a turn.
 */
async function run<T>(
  request: GenerateRequest,
  parse: (json: unknown) => T,
): Promise<RunResult<T>> {
  const chain = usableChain(Boolean(request.image));
  if (chain.length === 0) {
    throw new AppError('all_providers_failed', 'No intelligence provider is available');
  }

  const failures: string[] = [];
  const preferred = preferredProviderId();
  const overallStartedAt = performance.now();

  for (const provider of chain) {
    const elapsed = performance.now() - overallStartedAt;
    const remainingMs = GLOBAL_BUDGET_MS - elapsed;

    // If time is running out, skip to the terminal Demo provider to ensure completion before Vercel 30s kills the process
    if (remainingMs < 3000 && provider.id !== 'demo') {
      log.warn('skipping provider due to serverless execution deadline', {
        provider: provider.id,
        remainingMs: Math.round(remainingMs),
      });
      continue;
    }

    const providerTimeout = Math.min(provider.timeoutMs, Math.max(1000, remainingMs));
    const startedAt = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), providerTimeout);

    try {
      budget.record(provider.id);
      const result = await provider.generate(request, controller.signal);
      const data = parse(result.json);

      return {
        data,
        provenance: {
          provider: provider.id,
          model: result.model,
          degraded: provider.id !== preferred,
          latencyMs: Math.round(performance.now() - startedAt),
        },
      };
    } catch (cause) {
      const error =
        cause instanceof ProviderError
          ? cause
          : // A parse/validation throw lands here and is treated as bad output.
            new ProviderError(provider.id, 'invalid_output', String(cause), { cause });

      // Our own malformed request: another provider will fail identically.
      if (error.kind === 'bad_request') {
        throw new AppError('invalid_request', error.message, { cause: error });
      }

      // Only a spent daily allowance retires a provider. A per-minute throttle
      // demotes this one request and leaves the provider available next time.
      if (error.kind === 'quota') budget.markExhausted(provider.id);

      failures.push(`${provider.id}: ${error.kind}`);
      log.warn('provider failed, demoting to next in chain', {
        task: request.task,
        provider: provider.id,
        kind: error.kind,
        message: error.message.slice(0, 200),
      });
    } finally {
      clearTimeout(timer);
    }
  }

  throw new AppError('all_providers_failed', `Every provider failed (${failures.join('; ')})`);
}

export const intelligence = {
  /**
   * Cached, single-flighted crop diagnosis.
   * The image is hashed into the cache key, never stored.
   */
  async diagnoseCrop(input: DiagnoseRequest): Promise<RunResult<CropDiagnosis>> {
    const key = cacheKey('diagnose', [
      input.image,
      input.crop,
      input.language,
      input.symptoms,
      input.growthStage,
      input.location?.label,
      input.location?.countryCode,
    ]);

    const { value, hit } = await cached(key, () =>
      run<CropDiagnosis>(
        {
          task: 'crop_diagnosis',
          system: AGRONOMIST_SYSTEM_PROMPT,
          prompt: buildDiagnosisPrompt(input),
          image: input.image,
          schema: GEMINI_DIAGNOSIS_SCHEMA as unknown as Record<string, unknown>,
          maxOutputTokens: 2048,
        },
        parseCropDiagnosis,
      ),
    );

    return hit ? { ...value, provenance: { ...value.provenance, cached: true } } : value;
  },

  /**
   * Seven-day advisory. Disease risk and rainfall come from deterministic
   * heuristics; the model only turns them into sequenced, localised advice.
   */
  async generateAdvisory(input: {
    weather: WeatherSnapshot;
    crop?: string;
    growthStage?: string;
    language: string;
    soilSummary?: string;
  }): Promise<RunResult<Advisory>> {
    const risk = assessRisk(input.weather);

    const key = cacheKey('advisory', [
      input.weather.location.latitude?.toFixed(2),
      input.weather.location.longitude?.toFixed(2),
      input.weather.forecast[0]?.date,
      input.crop,
      input.growthStage,
      input.language,
      input.soilSummary,
    ]);

    const { value, hit } = await cached(
      key,
      () =>
        run<Advisory>(
          {
            task: 'farm_advisory',
            system: AGRONOMIST_SYSTEM_PROMPT,
            prompt: buildAdvisoryPrompt({
              ...(input.crop ? { crop: input.crop } : {}),
              ...(input.growthStage ? { growthStage: input.growthStage } : {}),
              ...(input.weather.location.label ? { locationLabel: input.weather.location.label } : {}),
              language: input.language,
              now: input.weather.now,
              forecast: input.weather.forecast,
              risk,
              ...(input.soilSummary ? { soilSummary: input.soilSummary } : {}),
            }),
            schema: GEMINI_ADVISORY_SCHEMA as unknown as Record<string, unknown>,
            maxOutputTokens: 2048,
          },
          (json) => {
            const parsed = parseAdvisoryModel(json);
            // Deterministic values win over anything the model said.
            return {
              summary: parsed.summary,
              days: parsed.days,
              irrigationGuidance: parsed.irrigationGuidance,
              diseaseRisk: risk.fungal,
              diseaseRiskReason: risk.fungalReason,
              regenerativePractices: parsed.regenerativePractices,
              disclaimer: parsed.disclaimer?.trim() || ADVISORY_DISCLAIMER,
            } satisfies Advisory;
          },
        ),
      // Advisories are stable within an hour; the forecast barely moves.
      60 * 60 * 1000,
    );

    return hit ? { ...value, provenance: { ...value.provenance, cached: true } } : value;
  },
};

/** Exposed for the weather route so the UI can show risk without an AI call. */
export { assessRisk };

/**
 * Soil advisory. The limiting factor and pH band are deterministic; the model
 * turns them into an affordable, sequenced plan.
 */
export async function analyzeSoil(input: SoilRequest): Promise<RunResult<SoilRecommendation>> {
  const assessment = assessSoil(input);

  const key = cacheKey('soil', [
    input.soilType,
    input.ph,
    input.nitrogen,
    input.phosphorus,
    input.potassium,
    input.moisturePct,
    input.organicCarbonPct,
    input.crop,
    input.growthStage,
    input.language,
  ]);

  const { value, hit } = await cached(key, () =>
    run<SoilRecommendation>(
      {
        task: 'soil_recommendation',
        system: AGRONOMIST_SYSTEM_PROMPT,
        prompt: buildSoilPrompt({ ...input, assessment }),
        schema: GEMINI_SOIL_SCHEMA as unknown as Record<string, unknown>,
        maxOutputTokens: 1536,
      },
      (json) => {
        const parsed = parseSoilRecommendation(json);
        return {
          summary: parsed.summary,
          // Deterministic value wins: this is the headline the UI leads with.
          limitingFactor: assessment.limitingFactor ?? 'No single limiting factor identified',
          recommendations: parsed.recommendations,
          regenerativePractices: parsed.regenerativePractices,
          cautions: parsed.cautions,
          disclaimer: parsed.disclaimer?.trim() || SOIL_DISCLAIMER,
        } satisfies SoilRecommendation;
      },
    ),
  );

  return hit ? { ...value, provenance: { ...value.provenance, cached: true } } : value;
}

/** Exposed so the soil route can show the deterministic part without an AI call. */
export { assessSoil };

/**
 * Answers a spoken or typed farm question, optionally with a photo attached.
 *
 * Not cached: unlike a diagnosis of a fixed image, questions are conversational
 * and the farm context underneath them changes through the day. Serving a stale
 * "yes, irrigate today" would be worse than spending a request.
 */
export async function answerQuestion(input: {
  question: string;
  language: string;
  context: VoiceContext;
  image?: string;
}): Promise<RunResult<AgriAnswerOutput>> {
  return run<AgriAnswerOutput>(
    {
      task: 'agri_answer',
      system: AGRONOMIST_SYSTEM_PROMPT,
      prompt: buildVoiceAnswerPrompt({
        question: input.question,
        language: input.language,
        context: input.context,
        hasImage: Boolean(input.image),
      }),
      ...(input.image ? { image: input.image } : {}),
      schema: GEMINI_ANSWER_SCHEMA as unknown as Record<string, unknown>,
      maxOutputTokens: 1024,
    },
    (json) => parseAgriAnswer(json),
  );
}
