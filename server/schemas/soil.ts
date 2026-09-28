/**
 * Soil advisory contracts.
 *
 * As with weather, the parts that are settled agronomy are computed here rather
 * than inferred: pH banding and which nutrient is most limiting follow directly
 * from the numbers. The model's job is to turn that into a sequenced plan a
 * smallholder can afford.
 *
 * Nothing in here invents a reading. Values are only ever what the farmer entered.
 */

import { z } from 'zod';

const NUTRIENT_LEVELS = ['low', 'medium', 'high'] as const;

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim().slice(0, max);
      return trimmed.length > 0 ? trimmed : undefined;
    });

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

export const soilRequestSchema = z.object({
  soilType: z.string().max(40).default('unknown'),
  /** Agricultural soils outside 3-10 indicate a measurement error, not a soil. */
  ph: z.number().min(3).max(10).optional(),
  nitrogen: z.enum(NUTRIENT_LEVELS).optional(),
  phosphorus: z.enum(NUTRIENT_LEVELS).optional(),
  potassium: z.enum(NUTRIENT_LEVELS).optional(),
  moisturePct: z.number().min(0).max(100).optional(),
  organicCarbonPct: z.number().min(0).max(30).optional(),
  crop: z.string().max(60).optional(),
  growthStage: z.string().max(30).optional(),
  language: z.string().min(2).max(12).default('en-IN'),
  locationLabel: z.string().max(120).optional(),
});

export type SoilRequest = z.infer<typeof soilRequestSchema>;

import { scrubDosages, scrubDosageText } from '../lib/scrubber.ts';

export const soilModelSchema = z.object({
  summary: z
    .string()
    .transform((value) => value.trim().slice(0, 500))
    .refine((value) => value.length > 0, 'Soil summary is empty'),
  recommendations: stringList(6),
  regenerativePractices: stringList(5),
  cautions: stringList(3),
  disclaimer: optionalText(300),
});

export function parseSoilRecommendation(raw: unknown) {
  const parsed = soilModelSchema.parse(raw);
  return {
    ...parsed,
    summary: scrubDosageText(parsed.summary),
    recommendations: scrubDosages(parsed.recommendations),
    regenerativePractices: scrubDosages(parsed.regenerativePractices),
    cautions: scrubDosages(parsed.cautions),
  };
}

export const GEMINI_SOIL_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description:
        'Two or three plain sentences on what this soil can and cannot support for this crop right now.',
    },
    recommendations: {
      type: 'array',
      description:
        'Ordered actions, most important first. Favour organic matter and correct timing over buying more input. Never give quantities.',
      items: { type: 'string' },
    },
    regenerativePractices: {
      type: 'array',
      description: 'Practices that build this specific soil over one to three seasons.',
      items: { type: 'string' },
    },
    cautions: {
      type: 'array',
      description: 'What would make things worse here, such as over-applying a nutrient already high.',
      items: { type: 'string' },
    },
    disclaimer: { type: 'string', description: 'One sentence on the limits of advice without a lab test.' },
  },
  required: ['summary', 'recommendations', 'regenerativePractices', 'cautions'],
  propertyOrdering: ['summary', 'recommendations', 'regenerativePractices', 'cautions', 'disclaimer'],
} as const;

export const SOIL_DISCLAIMER =
  'Based on the values you entered rather than a laboratory test. A local soil test gives a more reliable picture before you spend money on inputs.';

// ─── Deterministic soil assessment ───────────────────────────────────────────

export interface SoilAssessment {
  phBand: 'strongly acidic' | 'acidic' | 'slightly acidic' | 'neutral' | 'alkaline' | 'strongly alkaline' | 'unknown';
  phNote: string;
  /** The nutrient most likely holding yield back, or null if none stands out. */
  limitingFactor: string | null;
  limitingReason: string;
  organicMatterNote: string | null;
  moistureNote: string | null;
}

function bandForPh(ph: number): SoilAssessment['phBand'] {
  if (ph < 4.5) return 'strongly acidic';
  if (ph < 5.5) return 'acidic';
  if (ph < 6.5) return 'slightly acidic';
  if (ph <= 7.5) return 'neutral';
  if (ph <= 8.5) return 'alkaline';
  return 'strongly alkaline';
}

/**
 * Established relationships, computed rather than asked of a model.
 *
 * pH drives nutrient availability regardless of how much fertiliser is applied,
 * which is why it is assessed first: correcting pH often unlocks nutrients the
 * farmer has already paid for.
 */
export function assessSoil(input: SoilRequest): SoilAssessment {
  const phBand = input.ph === undefined ? 'unknown' : bandForPh(input.ph);

  const phNotes: Record<SoilAssessment['phBand'], string> = {
    'strongly acidic':
      'Strongly acidic soil locks up phosphorus and can release aluminium that damages roots. Liming matters more here than adding fertiliser.',
    acidic:
      'Acidic soil reduces phosphorus availability, so applied phosphorus may not reach the crop until pH improves.',
    'slightly acidic': 'Slightly acidic soil suits most crops well.',
    neutral: 'Near-neutral pH keeps most nutrients available to the crop.',
    alkaline:
      'Alkaline soil restricts availability of iron, zinc and phosphorus, which often shows as yellowing between leaf veins.',
    'strongly alkaline':
      'Strongly alkaline soil severely limits micronutrient uptake and usually needs organic matter and gypsum rather than more fertiliser.',
    unknown: 'No pH value was entered, so nutrient availability cannot be judged confidently.',
  };

  // Lowest declared nutrient governs the response: raising the others first wastes
  // money and can worsen the imbalance.
  const nutrients: Array<[string, string | undefined]> = [
    ['Nitrogen', input.nitrogen],
    ['Phosphorus', input.phosphorus],
    ['Potassium', input.potassium],
  ];
  const low = nutrients.filter(([, level]) => level === 'low').map(([name]) => name);
  const high = nutrients.filter(([, level]) => level === 'high').map(([name]) => name);

  let limitingFactor: string | null = null;
  let limitingReason = 'No single nutrient stands out as limiting from the values entered.';

  if (low.length === 1) {
    limitingFactor = low[0] as string;
    limitingReason = `${low[0]} is the lowest nutrient entered, so it is the most likely constraint on yield.`;
  } else if (low.length > 1) {
    limitingFactor = low.join(' and ');
    limitingReason = `${low.join(' and ')} are both low, so yield is likely constrained on more than one front.`;
  } else if (phBand === 'strongly acidic' || phBand === 'strongly alkaline') {
    limitingFactor = 'Soil pH';
    limitingReason = 'Nutrient levels look adequate, but pH is extreme enough to block uptake.';
  }

  const organicMatterNote =
    input.organicCarbonPct === undefined
      ? null
      : input.organicCarbonPct < 0.5
        ? 'Organic carbon is very low, so the soil holds little water or nutrition. Building organic matter is the highest-value long-term action.'
        : input.organicCarbonPct < 0.75
          ? 'Organic carbon is on the low side. Compost and residue retention would improve both water holding and nutrient supply.'
          : 'Organic carbon is reasonable, which helps the soil hold water and nutrients.';

  const moistureNote =
    input.moisturePct === undefined
      ? null
      : input.moisturePct < 20
        ? 'Soil moisture is low; the crop may already be under water stress.'
        : input.moisturePct > 70
          ? 'Soil moisture is very high. Waterlogging risks root disease and poor nutrient uptake.'
          : 'Soil moisture is in a workable range.';

  return {
    phBand,
    phNote: phNotes[phBand],
    limitingFactor,
    limitingReason:
      high.length > 0
        ? `${limitingReason} ${high.join(' and ')} ${high.length === 1 ? 'is' : 'are'} already high, so adding more would be wasted.`
        : limitingReason,
    organicMatterNote,
    moistureNote,
  };
}
