/**
 * Weather advisory contracts.
 *
 * Note what the model is NOT asked for: `diseaseRisk` and the rainfall figures are
 * computed deterministically in services/weather.ts from humidity, temperature and
 * precipitation. Established agronomy does not need inference, and a number the
 * model cannot hallucinate is a number we can defend to a judge.
 *
 * The model's job is narrower and genuinely language-shaped: turn those facts into
 * sequenced, localised advice a smallholder can act on this week.
 */

import { z } from 'zod';

const stringList = (max: number) =>
  z
    .array(z.unknown())
    .default([])
    .transform((items) =>
      items
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().slice(0, 300))
        .filter((item) => item.length > 0)
        .slice(0, max),
    );

const boundedText = (max: number) => z.string().transform((value) => value.trim().slice(0, max));

/** Tolerates an explicit null, which models emit freely for optional fields. */
const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim().slice(0, max);
      return trimmed.length > 0 ? trimmed : undefined;
    });

import { scrubDosages, scrubDosageText } from '../lib/scrubber.ts';

export const advisoryModelSchema = z.object({
  summary: boundedText(400).refine((value) => value.length > 0, 'Advisory summary is empty'),
  days: z
    .array(
      z.object({
        date: optionalText(24),
        headline: optionalText(90),
        detail: optionalText(280),
      }),
    )
    .default([])
    .transform((days) =>
      days
        .filter((day) => (day.headline?.length ?? 0) > 0)
        .slice(0, 7)
        .map((day) => ({
          date: day.date ?? '',
          headline: day.headline ?? '',
          detail: day.detail ?? '',
        })),
    ),
  irrigationGuidance: boundedText(400)
    .refine((value) => value.length > 0)
    .catch('Water at the base of plants early in the day and adjust to rainfall.'),
  regenerativePractices: stringList(4),
  disclaimer: optionalText(300),
});

export function parseAdvisoryModel(raw: unknown): AdvisoryModelOutput {
  const parsed = advisoryModelSchema.parse(raw);
  return {
    ...parsed,
    summary: scrubDosageText(parsed.summary),
    irrigationGuidance: scrubDosageText(parsed.irrigationGuidance),
    regenerativePractices: scrubDosages(parsed.regenerativePractices),
    days: parsed.days.map((day) => ({
      ...day,
      detail: scrubDosageText(day.detail),
    })),
  };
}

export type AdvisoryModelOutput = z.infer<typeof advisoryModelSchema>;

export const GEMINI_ADVISORY_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description:
        'Two or three sentences on what this week means for this crop, in plain language.',
    },
    days: {
      type: 'array',
      description: 'One entry per forecast day given, in the same order. Skip none.',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'The ISO date supplied for this day.' },
          headline: { type: 'string', description: 'Six words or fewer, e.g. "Hold irrigation".' },
          detail: { type: 'string', description: 'One sentence of specific, actionable advice.' },
        },
        required: ['date', 'headline', 'detail'],
      },
    },
    irrigationGuidance: {
      type: 'string',
      description: 'Concrete irrigation advice for the next 48 hours, given the rainfall outlook.',
    },
    regenerativePractices: {
      type: 'array',
      description: 'Regenerative actions that suit this weather window.',
      items: { type: 'string' },
    },
    disclaimer: { type: 'string', description: 'One cautious sentence about forecast uncertainty.' },
  },
  required: ['summary', 'days', 'irrigationGuidance', 'regenerativePractices'],
  propertyOrdering: ['summary', 'days', 'irrigationGuidance', 'regenerativePractices', 'disclaimer'],
} as const;

export const ADVISORY_DISCLAIMER =
  'Based on a weather forecast, which can change. Treat this as guidance rather than certainty, and check conditions in your own field.';
