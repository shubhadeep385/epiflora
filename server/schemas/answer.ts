/**
 * Spoken-answer contracts for the Voice Copilot.
 *
 * The length ceiling is not stylistic. Bulbul v3 accepts 2500 characters per
 * request, and a farmer listening to synthesised speech in a field wants an answer
 * in seconds, not a lecture. So the schema pushes the model toward something short
 * enough to speak in one pass.
 */

import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim().slice(0, max);
      return trimmed.length > 0 ? trimmed : undefined;
    });

const stringList = (max: number, itemMax: number) =>
  z
    .array(z.unknown())
    .default([])
    .transform((items) =>
      items
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().slice(0, itemMax))
        .filter((item) => item.length > 0)
        .slice(0, max),
    );

import { scrubDosages, scrubDosageText } from '../lib/scrubber.ts';

export const agriAnswerSchema = z.object({
  answer: z
    .string()
    .transform((value) => value.trim().slice(0, 1200))
    .refine((value) => value.length > 0, 'Answer is empty'),
  /** Suggested next questions, shown as tappable chips. */
  followUps: stringList(3, 90),
  /** Set when the question was not about farming at all. */
  offTopic: z
    .union([z.boolean(), z.null()])
    .optional()
    .transform((value) => value === true),
  disclaimer: optionalText(300),
});

export function parseAgriAnswer(raw: unknown): AgriAnswerOutput {
  const parsed = agriAnswerSchema.parse(raw);
  return {
    ...parsed,
    answer: scrubDosageText(parsed.answer),
    followUps: scrubDosages(parsed.followUps),
  };
}

export type AgriAnswerOutput = z.infer<typeof agriAnswerSchema>;

export const GEMINI_ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description:
        'The spoken answer. Aim for 60-120 words: short enough to listen to, specific enough to act on. Plain sentences, no markdown, no bullet characters, no headings — this will be read aloud.',
    },
    followUps: {
      type: 'array',
      description: 'Up to three natural follow-up questions this farmer might ask next.',
      items: { type: 'string' },
    },
    offTopic: {
      type: 'boolean',
      description:
        'True only if the question has nothing to do with farming, crops, soil, weather or livestock.',
    },
    disclaimer: {
      type: 'string',
      description: 'One short caution, only if the advice carries real risk. Omit otherwise.',
    },
  },
  required: ['answer', 'followUps'],
  propertyOrdering: ['offTopic', 'answer', 'followUps', 'disclaimer'],
} as const;

/** Transcription schema, used when Gemini stands in for a speech provider. */
export const GEMINI_TRANSCRIPT_SCHEMA = {
  type: 'object',
  properties: {
    transcript: {
      type: 'string',
      description:
        'Exactly what the speaker said, in their own language and script. Preserve mixed English and Indic words as spoken. Empty string if no speech is audible.',
    },
    languageCode: {
      type: 'string',
      description:
        'BCP-47 tag of the main language spoken, e.g. hi-IN, en-IN, mr-IN, ta-IN. Best guess.',
    },
    confidence: {
      type: 'number',
      description: 'Confidence 0-1 that the transcript and language are correct.',
    },
  },
  required: ['transcript', 'languageCode'],
  propertyOrdering: ['transcript', 'languageCode', 'confidence'],
} as const;

export const transcriptSchema = z.object({
  transcript: z.string().transform((value) => value.trim().slice(0, 2000)),
  languageCode: z
    .string()
    .transform((value) => value.trim() || 'en-IN')
    .catch('en-IN'),
  confidence: z.coerce
    .number()
    .transform((value) => Math.max(0, Math.min(1, value)))
    .catch(0.5),
});
