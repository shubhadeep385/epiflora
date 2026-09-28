/**
 * Voice routes.
 *
 * POST /api/voice/ask        the flagship: audio (+ optional photo) → spoken answer
 * POST /api/voice/transcribe audio → transcript only
 * POST /api/voice/synthesize text → audio only
 *
 * /ask is one round trip on purpose. The pipeline is three network hops
 * (STT → reasoning → TTS) and doing them from the client would be four, on a rural
 * connection, with the farmer holding the phone.
 *
 * Audio arrives as multipart rather than base64 JSON: it avoids a 33% size penalty
 * on an upload that is already the slowest part of the interaction.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { AppError, fail } from '../lib/http.ts';
import { LIMITS } from '../lib/env.ts';
import { log } from '../lib/logger.ts';
import { answerQuestion } from '../providers/registry.ts';
import { voice } from '../providers/voice/registry.ts';
import type { AudioInput } from '../providers/voice/types.ts';
import { getWeather, assessRisk } from '../services/weather.ts';

const voiceRoutes = new Hono();

/** Farm context sent alongside the audio, all optional. */
const contextSchema = z.object({
  crop: z.string().max(60).optional(),
  growthStage: z.string().max(30).optional(),
  locationLabel: z.string().max(120).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  soilSummary: z.string().max(300).optional(),
  farmSizeHectares: z.coerce.number().positive().max(100_000).optional(),
  recentDiagnoses: z
    .array(z.object({ crop: z.string().max(60), diagnosis: z.string().max(160), when: z.string().max(40) }))
    .max(3)
    .optional(),
});

/** JSON blobs inside multipart fields need parsing before validation. */
function parseJsonField(form: FormData, field: string): unknown {
  const raw = form.get(field);
  if (typeof raw !== 'string' || raw.trim().length === 0) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function readAudio(form: FormData): Promise<AudioInput> {
  const file = form.get('audio');
  if (!(file instanceof File)) {
    throw new AppError('invalid_request', 'No audio file was uploaded');
  }
  if (file.size === 0) {
    throw new AppError('invalid_request', 'The uploaded recording is empty');
  }
  if (file.size > LIMITS.maxAudioBytes) {
    throw new AppError(
      'audio_too_long',
      `Recording is ${Math.round(file.size / 1024 / 1024)}MB, over the limit`,
    );
  }

  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    mimeType: file.type || 'audio/webm',
    filename: file.name || 'question.webm',
  };
}

/** Optional string field, treating blanks as absent. */
function field(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

voiceRoutes.post('/transcribe', async (c) => {
  const form = await c.req.formData().catch(() => null);
  if (!form) return fail(c, 'invalid_request', 'Expected multipart form data');

  const audio = await readAudio(form);
  const { transcript, provenance } = await voice.transcribe(audio, field(form, 'language'));

  return c.json({ transcript, provenance });
});

const synthesizeSchema = z.object({
  text: z.string().min(1).max(5000),
  language: z.string().min(2).max(12).default('en-IN'),
});

voiceRoutes.post('/synthesize', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = synthesizeSchema.safeParse(body);
  if (!parsed.success) return fail(c, 'invalid_request', z.prettifyError(parsed.error));

  const result = await voice.synthesize(parsed.data.text, parsed.data.language);
  return c.json({
    audio: result.audio?.dataUrl ?? null,
    speakWithBrowser: result.useBrowserVoice,
    provenance: result.provenance,
  });
});

/**
 * The full pipeline. Accepts either recorded audio or typed text, because voice
 * must never be the only way in — a denied microphone permission or a noisy market
 * cannot be allowed to lock a farmer out of the feature.
 */
voiceRoutes.post('/ask', async (c) => {
  // Pre-stream content-length check to prevent memory exhaustion on oversized payloads
  const contentLength = Number(c.req.header('content-length') ?? 0);
  const maxPayloadBytes = LIMITS.maxAudioBytes + LIMITS.maxImageBytes;
  if (contentLength > maxPayloadBytes) {
    return fail(c, 'audio_too_long', 'Uploaded payload exceeds size limit');
  }

  const form = await c.req.formData().catch(() => null);
  if (!form) return fail(c, 'invalid_request', 'Expected multipart form data');

  const language = field(form, 'language');
  const typedQuestion = field(form, 'question');
  const hasAudio = form.get('audio') instanceof File;

  if (!hasAudio && !typedQuestion) {
    return fail(c, 'invalid_request', 'Provide either an audio recording or a typed question');
  }

  const contextResult = contextSchema.safeParse(parseJsonField(form, 'context') ?? {});
  if (!contextResult.success) {
    return fail(c, 'invalid_request', z.prettifyError(contextResult.error));
  }
  const context = contextResult.data;

  // ── 1. Speech to text ──────────────────────────────────────────────────────
  let question = typedQuestion ?? '';
  let speechProvenance = null;
  let detectedLanguage = language;

  if (hasAudio) {
    const audio = await readAudio(form);
    const result = await voice.transcribe(audio, language);
    question = result.transcript.text;
    speechProvenance = result.provenance;
    // An unspecified language is whatever Saaras detected, so the answer and the
    // spoken reply come back in the language the farmer actually used.
    detectedLanguage = language ?? result.transcript.language;
  }

  const answerLanguage = detectedLanguage ?? 'en-IN';

  // ── 2. Weather context ─────────────────────────────────────────────────────
  // Fetched server-side and cached, so "should I irrigate today?" is answered
  // against real numbers rather than the model's imagination.
  let weatherContext;
  if (context.latitude !== undefined && context.longitude !== undefined) {
    try {
      const snapshot = await getWeather({
        latitude: context.latitude,
        longitude: context.longitude,
        label: context.locationLabel ?? 'your area',
      });
      const risk = assessRisk(snapshot);
      weatherContext = {
        temperatureC: Math.round(snapshot.now.temperatureC),
        humidityPct: Math.round(snapshot.now.humidityPct),
        conditionLabel: snapshot.now.conditionLabel,
        rainNext24hMm: risk.rainNext24hMm,
        rainProbabilityNext24hPct: risk.rainProbabilityNext24hPct,
        fungalRisk: risk.fungal,
      };
    } catch (cause) {
      // Weather is context, not a prerequisite. Losing it must not lose the answer.
      log.warn('weather context unavailable for voice answer', { message: String(cause) });
    }
  }

  // ── 3. Agricultural reasoning ──────────────────────────────────────────────
  const image = form.get('image');
  let imageDataUrl: string | undefined;
  if (typeof image === 'string' && image.length > 32) {
    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(image)) {
      return fail(c, 'image_unreadable', 'Image must be a valid base64 image data URL (JPEG/PNG/WebP)');
    }
    if (image.length > LIMITS.maxImageBytes * 1.37) {
      return fail(c, 'invalid_request', 'Attached image exceeds maximum size limit');
    }
    imageDataUrl = image;
  }

  const { data: answer, provenance: intelligenceProvenance } = await answerQuestion({
    question,
    language: answerLanguage,
    ...(imageDataUrl ? { image: imageDataUrl } : {}),
    context: {
      ...(context.crop ? { crop: context.crop } : {}),
      ...(context.growthStage ? { growthStage: context.growthStage } : {}),
      ...(context.locationLabel ? { locationLabel: context.locationLabel } : {}),
      ...(context.soilSummary ? { soilSummary: context.soilSummary } : {}),
      ...(context.farmSizeHectares ? { farmSizeHectares: context.farmSizeHectares } : {}),
      ...(context.recentDiagnoses ? { recentDiagnoses: context.recentDiagnoses } : {}),
      ...(weatherContext ? { weather: weatherContext } : {}),
    },
  });

  // ── 4. Text to speech ──────────────────────────────────────────────────────
  const spoken = await voice.synthesize(answer.answer, answerLanguage);

  log.info('voice question answered', {
    viaAudio: hasAudio,
    withImage: Boolean(imageDataUrl),
    language: answerLanguage,
    languageWasDetected: !language,
    speech: speechProvenance?.provider ?? 'typed',
    intelligence: intelligenceProvenance.model,
    tts: spoken.provenance?.provider ?? 'browser',
    hadWeatherContext: Boolean(weatherContext),
    offTopic: answer.offTopic,
    // The question text itself is not logged: it is the farmer's own words.
    answerChars: answer.answer.length,
  });

  return c.json({
    transcript: {
      text: question,
      language: answerLanguage,
      languageProbability: speechProvenance ? undefined : null,
    },
    answer: answer.answer,
    followUps: answer.followUps,
    offTopic: answer.offTopic,
    disclaimer: answer.disclaimer ?? null,
    audio: spoken.audio?.dataUrl ?? null,
    speakWithBrowser: spoken.useBrowserVoice,
    provenance: {
      speech: speechProvenance,
      intelligence: intelligenceProvenance,
      tts: spoken.provenance,
    },
  });
});

export default voiceRoutes;
