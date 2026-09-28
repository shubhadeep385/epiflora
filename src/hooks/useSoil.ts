import { useCallback, useState } from 'react';
import type { NutrientLevel, Provenance, SoilRecommendation, SoilType } from '@shared/types.ts';
import { api, ApiRequestError } from '../lib/api.ts';
import { useAppStore } from '../store/appStore.ts';

/** Mirrors the deterministic assessment the server returns alongside the advice. */
export interface SoilAssessment {
  phBand: string;
  phNote: string;
  limitingFactor: string | null;
  limitingReason: string;
  organicMatterNote: string | null;
  moistureNote: string | null;
}

export interface SoilInput {
  soilType: SoilType;
  ph?: number;
  nitrogen?: NutrientLevel;
  phosphorus?: NutrientLevel;
  potassium?: NutrientLevel;
  moisturePct?: number;
  organicCarbonPct?: number;
}

interface State {
  status: 'idle' | 'working' | 'done' | 'error';
  soil: SoilRecommendation | null;
  assessment: SoilAssessment | null;
  provenance: Provenance | null;
  error: string | null;
}

const IDLE: State = { status: 'idle', soil: null, assessment: null, provenance: null, error: null };

export function useSoil() {
  const [state, setState] = useState<State>(IDLE);

  const language = useAppStore((store) => store.language);
  const primaryCrop = useAppStore((store) => store.primaryCrop);
  const location = useAppStore((store) => store.location);
  const setSoil = useAppStore((store) => store.setSoil);

  const reset = useCallback(() => setState(IDLE), []);

  const analyse = useCallback(
    async (input: SoilInput) => {
      setState({ ...IDLE, status: 'working' });

      try {
        const body = await api.postJson<{
          soil: SoilRecommendation;
          assessment: SoilAssessment;
          provenance: Provenance;
        }>('/ai/soil', {
          ...input,
          language,
          ...(primaryCrop ? { crop: primaryCrop } : {}),
          ...(location?.label ? { locationLabel: location.label } : {}),
        });

        // Persisted so the dashboard and Voice Copilot can use it as context.
        // Every value is tagged 'user' — these are entered, not measured by us.
        setSoil({
          soilType: input.soilType,
          ...(input.ph !== undefined ? { ph: { value: input.ph, source: 'user' } } : {}),
          ...(input.nitrogen ? { nitrogen: { value: input.nitrogen, source: 'user' } } : {}),
          ...(input.phosphorus ? { phosphorus: { value: input.phosphorus, source: 'user' } } : {}),
          ...(input.potassium ? { potassium: { value: input.potassium, source: 'user' } } : {}),
          ...(input.moisturePct !== undefined
            ? { moisturePct: { value: input.moisturePct, source: 'user', unit: '%' } }
            : {}),
          ...(input.organicCarbonPct !== undefined
            ? { organicCarbonPct: { value: input.organicCarbonPct, source: 'user', unit: '%' } }
            : {}),
        });

        setState({
          status: 'done',
          soil: body.soil,
          assessment: body.assessment,
          provenance: body.provenance,
          error: null,
        });
        return body.soil;
      } catch (cause) {
        setState({
          ...IDLE,
          status: 'error',
          error:
            cause instanceof ApiRequestError
              ? cause.friendlyMessage
              : 'Could not analyse the soil values.',
        });
        return null;
      }
    },
    [language, location?.label, primaryCrop, setSoil],
  );

  return { ...state, analyse, reset };
}
