import { useCallback, useRef, useState } from 'react';
import type { CropDiagnosis, GrowthStage, LocationRef, Provenance } from '@shared/types.ts';
import { api, ApiRequestError } from '../lib/api.ts';
import { makeThumbnail } from '../lib/image.ts';
import { useAppStore } from '../store/appStore.ts';

/** Named stages so a multi-second wait reads as progress, not a hang. */
export const DIAGNOSIS_STAGES = [
  'Examining visible symptoms',
  'Comparing disease patterns',
  'Considering crop and local context',
  'Preparing recommendations',
] as const;

interface DiagnoseInput {
  image: string;
  crop: string;
  symptoms?: string;
  growthStage?: GrowthStage;
  location?: LocationRef | null;
}

interface DiagnosisResponse {
  diagnosis: CropDiagnosis;
  provenance: Provenance;
}

interface State {
  status: 'idle' | 'running' | 'done' | 'error';
  /** Index into DIAGNOSIS_STAGES. */
  stage: number;
  result: DiagnosisResponse | null;
  error: { message: string; retryable: boolean } | null;
}

const IDLE: State = { status: 'idle', stage: 0, result: null, error: null };

export function useDiagnosis() {
  const [state, setState] = useState<State>(IDLE);
  const timers = useRef<number[]>([]);
  const addDiagnosis = useAppStore((store) => store.addDiagnosis);
  const language = useAppStore((store) => store.language);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState(IDLE);
  }, [clearTimers]);

  const run = useCallback(
    async (input: DiagnoseInput) => {
      clearTimers();
      setState({ status: 'running', stage: 0, result: null, error: null });

      // Advance the visible stages on a timer. The real call has no progress
      // events, so this is presentational — it stops before the final stage so it
      // can never claim completion the request has not reached.
      DIAGNOSIS_STAGES.slice(1, -1).forEach((_, index) => {
        const id = window.setTimeout(
          () => setState((prev) => (prev.status === 'running' ? { ...prev, stage: index + 1 } : prev)),
          1200 * (index + 1),
        );
        timers.current.push(id);
      });

      try {
        const response = await api.postJson<DiagnosisResponse>('/ai/diagnose', {
          image: input.image,
          crop: input.crop,
          language,
          ...(input.symptoms?.trim() ? { symptoms: input.symptoms.trim() } : {}),
          ...(input.growthStage ? { growthStage: input.growthStage } : {}),
          ...(input.location
            ? {
                location: {
                  ...(input.location.label ? { label: input.location.label } : {}),
                  ...(input.location.region ? { region: input.location.region } : {}),
                  ...(input.location.countryCode
                    ? { countryCode: input.location.countryCode }
                    : {}),
                },
              }
            : {}),
        });

        clearTimers();
        setState({
          status: 'done',
          stage: DIAGNOSIS_STAGES.length - 1,
          result: response,
          error: null,
        });

        // Only worth remembering if the photo actually supported an assessment.
        if (response.diagnosis.imageQuality !== 'unusable') {
          const thumbnailDataUrl = await makeThumbnail(input.image).catch(() => undefined);
          addDiagnosis({
            crop: input.crop,
            diagnosis: response.diagnosis,
            provenance: response.provenance,
            ...(thumbnailDataUrl ? { thumbnailDataUrl } : {}),
            location: input.location ?? null,
          });
        }

        return response;
      } catch (cause) {
        clearTimers();
        const isApi = cause instanceof ApiRequestError;
        setState({
          status: 'error',
          stage: 0,
          result: null,
          error: {
            message: isApi
              ? cause.friendlyMessage
              : 'Something went wrong preparing the diagnosis. Please try again.',
            retryable: isApi ? cause.retryable : true,
          },
        });
        return null;
      }
    },
    [addDiagnosis, clearTimers, language],
  );

  return { ...state, run, reset };
}
