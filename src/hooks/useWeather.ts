import { useCallback, useEffect, useState } from 'react';
import type { Advisory, LocationRef, Provenance, WeatherSnapshot } from '@shared/types.ts';
import { api, ApiRequestError } from '../lib/api.ts';
import { useAppStore } from '../store/appStore.ts';

export interface WeatherRisk {
  fungal: 'low' | 'elevated' | 'high';
  fungalReason: string;
  rainNext24hMm: number;
  rainProbabilityNext24hPct: number;
  irrigationHint: string;
  heatStress: boolean;
}

interface WeatherState {
  weather: WeatherSnapshot | null;
  risk: WeatherRisk | null;
  loading: boolean;
  error: string | null;
}

/**
 * Forecast and deterministic risk, deliberately separate from the AI advisory.
 *
 * The weather panel renders from this alone, so it still works when every AI
 * provider is exhausted — and it appears immediately rather than waiting on a
 * model round trip.
 */
export function useWeather(location: LocationRef | null): WeatherState & { reload: () => void } {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    risk: null,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (location?.latitude === undefined || location.longitude === undefined) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        ...(location.label ? { label: location.label } : {}),
      });
      const body = await api.get<{ weather: WeatherSnapshot; risk: WeatherRisk }>(
        `/weather?${params.toString()}`,
      );
      setState({ weather: body.weather, risk: body.risk, loading: false, error: null });
    } catch (cause) {
      setState({
        weather: null,
        risk: null,
        loading: false,
        error: cause instanceof ApiRequestError ? cause.friendlyMessage : 'Could not load weather.',
      });
    }
  }, [location?.latitude, location?.longitude, location?.label]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: () => void load() };
}

interface AdvisoryState {
  advisory: Advisory | null;
  provenance: Provenance | null;
  loading: boolean;
  error: string | null;
}

/** The AI layer on top of the forecast. Requested explicitly, not on page load. */
export function useAdvisory(location: LocationRef | null) {
  const language = useAppStore((store) => store.language);
  const primaryCrop = useAppStore((store) => store.primaryCrop);
  const [state, setState] = useState<AdvisoryState>({
    advisory: null,
    provenance: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(
    async (options?: { crop?: string; growthStage?: string }) => {
      if (location?.latitude === undefined || location.longitude === undefined) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const body = await api.postJson<{ advisory: Advisory; provenance: Provenance }>(
          '/ai/advisory',
          {
            latitude: location.latitude,
            longitude: location.longitude,
            language,
            ...(location.label ? { label: location.label } : {}),
            ...(options?.crop ?? primaryCrop ? { crop: options?.crop ?? primaryCrop } : {}),
            ...(options?.growthStage ? { growthStage: options.growthStage } : {}),
          },
        );
        setState({
          advisory: body.advisory,
          provenance: body.provenance,
          loading: false,
          error: null,
        });
      } catch (cause) {
        setState({
          advisory: null,
          provenance: null,
          loading: false,
          error:
            cause instanceof ApiRequestError
              ? cause.friendlyMessage
              : 'Could not prepare the advisory.',
        });
      }
    },
    [language, location?.latitude, location?.longitude, location?.label, primaryCrop],
  );

  return { ...state, generate };
}
