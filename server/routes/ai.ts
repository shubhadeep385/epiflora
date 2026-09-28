/**
 * Agricultural intelligence routes.
 *
 * These exist so the browser never holds a provider key. Validation happens here,
 * before anything reaches a model, and again on the way back out.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { AppError, fail } from '../lib/http.ts';
import { LIMITS } from '../lib/env.ts';
import { log } from '../lib/logger.ts';
import { diagnoseRequestSchema } from '../schemas/diagnosis.ts';
import { soilRequestSchema } from '../schemas/soil.ts';
import { analyzeSoil, assessSoil, intelligence } from '../providers/registry.ts';
import { getWeather } from '../services/weather.ts';

const ai = new Hono();

ai.post('/diagnose', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid_request', 'Request body must be JSON');

  const parsed = diagnoseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, 'invalid_request', z.prettifyError(parsed.error));
  }

  const input = parsed.data;

  // base64 inflates by ~4/3; this is the server-side backstop behind the
  // client-side downscale, not the primary defence.
  const approxBytes = Math.floor((input.image.length * 3) / 4);
  if (approxBytes > LIMITS.maxImageBytes) {
    return fail(
      c,
      'image_unreadable',
      `Image is ${Math.round(approxBytes / 1024 / 1024)}MB, over the ${
        LIMITS.maxImageBytes / 1024 / 1024
      }MB limit`,
    );
  }

  try {
    const { data: diagnosis, provenance } = await intelligence.diagnoseCrop(input);

    log.info('crop diagnosis served', {
      crop: input.crop,
      provider: provenance.provider,
      model: provenance.model,
      degraded: provenance.degraded,
      cached: provenance.cached ?? false,
      latencyMs: provenance.latencyMs,
      // The verdict is useful signal; the image and location are not logged.
      imageQuality: diagnosis.imageQuality,
    });

    return c.json({ diagnosis, provenance });
  } catch (cause) {
    if (cause instanceof AppError) throw cause;
    throw new AppError('internal', `Diagnosis failed: ${String(cause)}`, { cause });
  }
});

const advisoryRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().max(120).optional(),
  crop: z.string().max(60).optional(),
  growthStage: z.string().max(30).optional(),
  language: z.string().min(2).max(12).default('en-IN'),
  soilSummary: z.string().max(300).optional(),
});

ai.post('/advisory', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid_request', 'Request body must be JSON');

  const parsed = advisoryRequestSchema.safeParse(body);
  if (!parsed.success) return fail(c, 'invalid_request', z.prettifyError(parsed.error));

  const input = parsed.data;

  try {
    // The forecast is fetched server-side rather than trusted from the client:
    // the advisory's credibility rests on the numbers being real.
    const weather = await getWeather({
      latitude: input.latitude,
      longitude: input.longitude,
      label: input.label ?? `${input.latitude.toFixed(2)}, ${input.longitude.toFixed(2)}`,
    });

    const { data: advisory, provenance } = await intelligence.generateAdvisory({
      weather,
      language: input.language,
      ...(input.crop ? { crop: input.crop } : {}),
      ...(input.growthStage ? { growthStage: input.growthStage } : {}),
      ...(input.soilSummary ? { soilSummary: input.soilSummary } : {}),
    });

    log.info('advisory served', {
      provider: provenance.provider,
      model: provenance.model,
      degraded: provenance.degraded,
      cached: provenance.cached ?? false,
      latencyMs: provenance.latencyMs,
      diseaseRisk: advisory.diseaseRisk,
    });

    return c.json({ advisory, weather, provenance });
  } catch (cause) {
    if (cause instanceof AppError) throw cause;
    throw new AppError('internal', `Advisory failed: ${String(cause)}`, { cause });
  }
});

ai.post('/soil', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid_request', 'Request body must be JSON');

  const parsed = soilRequestSchema.safeParse(body);
  if (!parsed.success) return fail(c, 'invalid_request', z.prettifyError(parsed.error));

  const input = parsed.data;

  // At least one reading is needed, or there is nothing to advise on.
  const hasAnyReading = [
    input.ph,
    input.nitrogen,
    input.phosphorus,
    input.potassium,
    input.moisturePct,
    input.organicCarbonPct,
  ].some((value) => value !== undefined);

  if (!hasAnyReading && input.soilType === 'unknown') {
    return fail(c, 'invalid_request', 'Enter at least one soil value or a soil type');
  }

  try {
    const { data: soil, provenance } = await analyzeSoil(input);

    log.info('soil advisory served', {
      provider: provenance.provider,
      model: provenance.model,
      degraded: provenance.degraded,
      cached: provenance.cached ?? false,
      limitingFactor: soil.limitingFactor,
    });

    // The deterministic part is returned alongside so the UI can show it as
    // calculated rather than generated.
    return c.json({ soil, assessment: assessSoil(input), provenance });
  } catch (cause) {
    if (cause instanceof AppError) throw cause;
    throw new AppError('internal', `Soil advisory failed: ${String(cause)}`, { cause });
  }
});

export default ai;
