/**
 * Crop Doctor contracts.
 *
 * Two schemas live here on purpose, side by side so they cannot drift apart
 * unnoticed:
 *   1. `cropDiagnosisSchema` — zod, validates whatever the model actually returned.
 *   2. `GEMINI_DIAGNOSIS_SCHEMA` — the OpenAPI-subset shape Gemini accepts for
 *      structured output. Gemini rejects standard JSON Schema keywords such as
 *      $schema and additionalProperties, so it is written by hand rather than
 *      generated.
 *
 * Rule from the plan: never trust arbitrary model output. Nothing reaches the UI
 * without passing through here.
 */

import { z } from 'zod';
import type { CropDiagnosis } from '../../shared/types.ts';

// ─── Request ─────────────────────────────────────────────────────────────────

const SEVERITY = ['low', 'moderate', 'high', 'critical'] as const;
const IMAGE_QUALITY = ['good', 'unclear', 'unusable'] as const;
const GROWTH_STAGE = [
  'sowing',
  'germination',
  'vegetative',
  'flowering',
  'fruiting',
  'maturity',
  'harvest',
] as const;

export const diagnoseRequestSchema = z.object({
  /** Data URL from the client after downscaling (JPEG/PNG/WebP). */
  image: z
    .string()
    .min(32, 'Image payload is empty')
    .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, 'Image must be a base64 image data URL'),
  crop: z.string().min(1).max(60),
  symptoms: z.string().max(600).optional(),
  growthStage: z.enum(GROWTH_STAGE).optional(),
  language: z.string().min(2).max(12).default('en-IN'),
  location: z
    .object({
      label: z.string().max(120).optional(),
      region: z.string().max(120).optional(),
      countryCode: z.string().length(2).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    })
    .optional(),
  /** Optional weather/soil context so advice is localised, not generic. */
  context: z
    .object({
      temperatureC: z.number().optional(),
      humidityPct: z.number().optional(),
      recentRainMm: z.number().optional(),
      soilType: z.string().max(40).optional(),
      soilMoisturePct: z.number().optional(),
    })
    .optional(),
});

export type DiagnoseRequest = z.infer<typeof diagnoseRequestSchema>;

// ─── Model output ────────────────────────────────────────────────────────────

/**
 * Trims list noise: models over-produce and routinely emit empty entries.
 *
 * Cleaning happens *before* validation on purpose. Rejecting the whole payload
 * over one blank array item would trigger a pointless repair retry and burn a
 * request from a metered free tier. Be tolerant about shape, strict about meaning.
 */
const stringList = (max: number) =>
  z
    .array(z.unknown())
    .default([])
    .transform((items) =>
      items
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().slice(0, 400))
        .filter((item) => item.length > 0)
        .slice(0, max),
    );

/** Over-long free text is truncated rather than treated as a failure. */
const boundedText = (max: number) =>
  z.string().transform((value) => value.trim().slice(0, max));

/**
 * Optional text that tolerates an explicit null.
 *
 * Models routinely emit `null` to mean "no value" for an optional field, and zod's
 * `.optional()` accepts only `undefined`. Rejecting null threw away an otherwise
 * good OpenRouter answer over a single field and silently demoted to Demo Mode, so
 * null is normalised to undefined instead.
 */
const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim().slice(0, max);
      return trimmed.length > 0 ? trimmed : undefined;
    });

export const cropDiagnosisSchema = z.object({
  // An empty diagnosis genuinely is unusable, so this one stays strict.
  diagnosis: boundedText(160).refine((value) => value.length > 0, 'Diagnosis text is empty'),
  confidence: z.coerce
    .number()
    .transform((n) => Math.max(0, Math.min(100, Math.round(n))))
    .catch(0),
  severity: z.enum(SEVERITY).catch('moderate'),
  imageQuality: z.enum(IMAGE_QUALITY).catch('unclear'),
  symptoms: stringList(6),
  causes: stringList(4),
  recommendations: stringList(6),
  organicRemedies: stringList(5),
  chemicalOptions: stringList(4),
  prevention: stringList(5),
  regenerativePractices: stringList(4),
  urgency: boundedText(200)
    .refine((value) => value.length > 0)
    .catch('Monitor the crop over the next few days.'),
  weatherRiskNote: optionalText(300),
  disclaimer: optionalText(400),
});

const DEFAULT_DISCLAIMER =
  'This is an AI assessment from a single photo, not a confirmed diagnosis. For severe or spreading damage, confirm with a local agricultural expert before treating.';

import { scrubDosages } from '../lib/scrubber.ts';

/**
 * Parses and normalises raw model output into a safe CropDiagnosis.
 * Throws a zod error when the payload is unusable, which the registry treats as
 * a provider failure worth one repair retry before demotion.
 */
export function parseCropDiagnosis(raw: unknown): CropDiagnosis {
  const parsed = cropDiagnosisSchema.parse(raw);

  // An unusable photo must not produce a confident-looking answer.
  const confidence = parsed.imageQuality === 'unusable' ? 0 : parsed.confidence;

  return {
    ...parsed,
    confidence,
    recommendations: scrubDosages(parsed.recommendations),
    organicRemedies: scrubDosages(parsed.organicRemedies),
    chemicalOptions: scrubDosages(parsed.chemicalOptions),
    prevention: scrubDosages(parsed.prevention),
    disclaimer: parsed.disclaimer?.trim() || DEFAULT_DISCLAIMER,
  };
}

// ─── Gemini structured-output schema (OpenAPI subset) ────────────────────────

const arrayOfStrings = (description: string) => ({
  type: 'array',
  description,
  items: { type: 'string' },
});

export const GEMINI_DIAGNOSIS_SCHEMA = {
  type: 'object',
  properties: {
    diagnosis: {
      type: 'string',
      description:
        'Most likely disease, pest or disorder. If the image is unusable, say "Unclear image".',
    },
    confidence: {
      type: 'integer',
      description: 'Confidence 0-100 in this assessment from this single photo.',
    },
    severity: { type: 'string', enum: [...SEVERITY] },
    imageQuality: {
      type: 'string',
      enum: [...IMAGE_QUALITY],
      description: 'Honest assessment of whether the photo supports a diagnosis at all.',
    },
    symptoms: arrayOfStrings('Symptoms actually visible in this image. Do not invent any.'),
    causes: arrayOfStrings('Likely causes given crop, region and conditions.'),
    recommendations: arrayOfStrings('Practical steps a smallholder can take within days.'),
    organicRemedies: arrayOfStrings('Affordable organic or biological options, listed first.'),
    chemicalOptions: arrayOfStrings(
      'Chemical classes only, named generically. Never include dosages, concentrations or mixing rates.',
    ),
    prevention: arrayOfStrings('How to avoid recurrence next season.'),
    regenerativePractices: arrayOfStrings(
      'Regenerative practices relevant here: rotation, cover crops, compost, IPM, water conservation.',
    ),
    urgency: { type: 'string', description: 'How soon to act, in one plain sentence.' },
    weatherRiskNote: {
      type: 'string',
      description: 'How the supplied weather or soil context changes the risk. Omit if none given.',
    },
    disclaimer: { type: 'string', description: 'One cautious sentence about AI limitations.' },
  },
  required: [
    'diagnosis',
    'confidence',
    'severity',
    'imageQuality',
    'symptoms',
    'causes',
    'recommendations',
    'organicRemedies',
    'prevention',
    'regenerativePractices',
    'urgency',
  ],
  propertyOrdering: [
    'imageQuality',
    'diagnosis',
    'confidence',
    'severity',
    'symptoms',
    'causes',
    'urgency',
    'recommendations',
    'organicRemedies',
    'chemicalOptions',
    'prevention',
    'regenerativePractices',
    'weatherRiskNote',
    'disclaimer',
  ],
} as const;

/**
 * The same shape as standard JSON Schema, for OpenAI-compatible providers such as
 * OpenRouter. Derived from the Gemini schema rather than written twice: only the
 * dialect differs (propertyOrdering is Gemini-only; additionalProperties is not
 * accepted by Gemini but is required by strict OpenAI-style validators).
 */
export function jsonSchemaForDiagnosis(): Record<string, unknown> {
  const { propertyOrdering: _ordering, ...rest } = GEMINI_DIAGNOSIS_SCHEMA;
  return {
    ...structuredClone(rest),
    additionalProperties: false,
  };
}
