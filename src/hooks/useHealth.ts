import { useEffect, useState } from 'react';
import type { HealthResponse, ProviderStatus } from '@shared/types.ts';
import { api } from '../lib/api.ts';

interface HealthState {
  health: HealthResponse | null;
  loading: boolean;
  /** True when the API itself is unreachable. */
  offline: boolean;
}

/**
 * Reads provider availability so the UI can be honest about which intelligence
 * answered. Failure here is non-fatal by design: the status pill degrades, the
 * rest of the app carries on.
 */
export function useHealth(): HealthState {
  const [state, setState] = useState<HealthState>({
    health: null,
    loading: true,
    offline: false,
  });

  useEffect(() => {
    let active = true;

    api
      .health()
      .then((health) => {
        if (active) setState({ health, loading: false, offline: false });
      })
      .catch(() => {
        if (active) setState({ health: null, loading: false, offline: true });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

/** First configured provider with budget left — what will actually answer. */
export function activeProvider(providers: ProviderStatus[] | undefined): ProviderStatus | null {
  if (!providers) return null;
  return providers.find((p) => p.configured && !p.exhausted) ?? providers.at(-1) ?? null;
}
