

import type { DiagnosisRecord, SoilReading, Severity } from '@shared/types.ts';
import type { WeatherRisk } from '../hooks/useWeather.ts';

export interface FarmHealth {
  /** 0-100. Starts at a neutral baseline and moves with real evidence only. */
  score: number;
  band: 'good' | 'fair' | 'attention';
  /** Plain-language reasons, so the number is never unexplained. */
  factors: Array<{ label: string; delta: number }>;
  /** The single most useful next action, or null when nothing stands out. */
  nextAction: string | null;
  /** How much of the picture is actually known, 0-1. */
  completeness: number;
}

const BASELINE = 70;

const SEVERITY_PENALTY: Record<Severity, number> = {
  low: 4,
  moderate: 10,
  high: 18,
  critical: 26,
};

/** Recent diagnoses matter; a problem from three months ago probably does not. */
const RECENT_DAYS = 21;

export function computeFarmHealth(input: {
  soil: SoilReading | null;
  risk: WeatherRisk | null;
  history: DiagnosisRecord[];
  hasLocation: boolean;
}): FarmHealth {
  const factors: FarmHealth['factors'] = [];
  let score = BASELINE;
  let nextAction: string | null = null;

  // ── Weather-driven disease pressure ────────────────────────────────────────
  if (input.risk) {
    if (input.risk.fungal === 'high') {
      score -= 14;
      factors.push({ label: 'High fungal disease pressure in current weather', delta: -14 });
      nextAction = 'Check lower leaves for early disease spots and improve airflow between plants.';
    } else if (input.risk.fungal === 'elevated') {
      score -= 7;
      factors.push({ label: 'Elevated fungal disease risk', delta: -7 });
    } else {
      score += 5;
      factors.push({ label: 'Low disease pressure in current weather', delta: 5 });
    }

    if (input.risk.heatStress) {
      score -= 8;
      factors.push({ label: 'Heat stress conditions', delta: -8 });
      nextAction ??= 'Water early in the day and shade young plants if you can.';
    }

    if (input.risk.rainProbabilityNext24hPct >= 60) {
      // Not a health penalty — it is actionable information.
      nextAction ??= 'Rain is likely within a day, so hold off on irrigation.';
    }
  }

  // ── Recent crop problems ───────────────────────────────────────────────────
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const recent = input.history.filter((record) => new Date(record.createdAt).getTime() > cutoff);

  const worst = recent.reduce<DiagnosisRecord | null>((acc, record) => {
    if (record.diagnosis.imageQuality === 'unusable') return acc;
    if (!acc) return record;
    return SEVERITY_PENALTY[record.diagnosis.severity] > SEVERITY_PENALTY[acc.diagnosis.severity]
      ? record
      : acc;
  }, null);

  if (worst) {
    const penalty = SEVERITY_PENALTY[worst.diagnosis.severity];
    score -= penalty;
    factors.push({
      label: `Recent diagnosis: ${worst.diagnosis.diagnosis} (${worst.diagnosis.severity})`,
      delta: -penalty,
    });
    if (worst.diagnosis.severity === 'high' || worst.diagnosis.severity === 'critical') {
      nextAction = worst.diagnosis.recommendations[0] ?? nextAction;
    }
  }

  // ── Soil ───────────────────────────────────────────────────────────────────
  if (input.soil) {
    const ph = input.soil.ph?.value;
    if (ph !== undefined) {
      if (ph >= 6 && ph <= 7.5) {
        score += 6;
        factors.push({ label: 'Soil pH in a good range', delta: 6 });
      } else if (ph < 5 || ph > 8.5) {
        score -= 10;
        factors.push({ label: 'Soil pH limits nutrient uptake', delta: -10 });
        nextAction ??= 'Soil pH is the main constraint — correct that before adding more nutrients.';
      } else {
        score -= 4;
        factors.push({ label: 'Soil pH slightly outside ideal range', delta: -4 });
      }
    }

    const lowNutrients = [
      input.soil.nitrogen?.value,
      input.soil.phosphorus?.value,
      input.soil.potassium?.value,
    ].filter((level) => level === 'low').length;

    if (lowNutrients > 0) {
      const penalty = lowNutrients * 5;
      score -= penalty;
      factors.push({
        label: `${lowNutrients} nutrient${lowNutrients > 1 ? 's' : ''} measured low`,
        delta: -penalty,
      });
    }

    const carbon = input.soil.organicCarbonPct?.value;
    if (carbon !== undefined) {
      if (carbon < 0.5) {
        score -= 8;
        factors.push({ label: 'Very low soil organic carbon', delta: -8 });
        nextAction ??= 'Add compost or retain crop residue to start building organic matter.';
      } else if (carbon >= 0.75) {
        score += 5;
        factors.push({ label: 'Healthy soil organic carbon', delta: 5 });
      }
    }
  }

  // How much of this is actually informed by data.
  const known = [input.hasLocation, Boolean(input.soil), input.history.length > 0].filter(
    Boolean,
  ).length;

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: clamped,
    band: clamped >= 75 ? 'good' : clamped >= 55 ? 'fair' : 'attention',
    factors,
    nextAction,
    completeness: known / 3,
  };
}
