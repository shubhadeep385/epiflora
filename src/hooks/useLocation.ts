import { useCallback, useState } from 'react';
import type { LocationRef } from '@shared/types.ts';
import { api, ApiRequestError } from '../lib/api.ts';
import { useAppStore } from '../store/appStore.ts';

interface State {
  status: 'idle' | 'locating' | 'searching' | 'error';
  error: string | null;
}

/**
 * Location handling.
 *
 * Provides high-accuracy GPS location detection with instant reverse-geocoding,
 * alongside automatic network IP fallback and manual district search.
 */
export function useLocation() {
  const location = useAppStore((store) => store.location);
  const setLocation = useAppStore((store) => store.setLocation);
  const [state, setState] = useState<State>({ status: 'idle', error: null });

  /** Resolves coordinates to a high-precision named place (city, district, state) */
  const resolveLocationName = useCallback(
    async (latitude: number, longitude: number): Promise<LocationRef> => {
      try {
        const res = await api.get<{ location: LocationRef }>(
          `/weather/reverse?latitude=${latitude}&longitude=${longitude}`,
        );
        if (res.location && res.location.label) {
          return res.location;
        }
      } catch (err) {
        // Non-fatal, use coordinate label fallback
      }
      return {
        label: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
        latitude,
        longitude,
      };
    },
    [],
  );

  /** IP-based fallback when browser permissions are denied or device lacks GPS */
  const fallbackIpLocation = useCallback(async () => {
    try {
      const res = await api.get<{ location: LocationRef }>('/weather/detect');
      if (res.location) {
        setLocation(res.location);
        setState({ status: 'idle', error: null });
        return;
      }
    } catch (err) {
      // Non-fatal
    }
    setState({
      status: 'error',
      error: 'Location access was unavailable. Please type your town or district name.',
    });
  }, [setLocation]);

  /** Requests high-accuracy GPS position and reverse-geocodes to exact town/district */
  const useCurrentPosition = useCallback(() => {
    if (!('geolocation' in navigator)) {
      void fallbackIpLocation();
      return;
    }

    setState({ status: 'locating', error: null });

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const namedLocation = await resolveLocationName(latitude, longitude);
      setLocation(namedLocation);
      setState({ status: 'idle', error: null });
    };

    const handleFailure = (error: GeolocationPositionError) => {
      // If high-accuracy timed out (common indoors), try standard accuracy once before IP fallback
      if (error.code === error.TIMEOUT) {
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          () => void fallbackIpLocation(),
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 },
        );
        return;
      }

      // If denied or unavailable, use server-side network IP detection
      void fallbackIpLocation();
    };

    // First attempt: High Accuracy GPS / Wifi Positioning
    navigator.geolocation.getCurrentPosition(handleSuccess, handleFailure, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 0,
    });
  }, [setLocation, resolveLocationName, fallbackIpLocation]);

  const search = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) return;
      setState({ status: 'searching', error: null });
      try {
        const { location: found } = await api.get<{ location: LocationRef | null }>(
          `/weather/search?q=${encodeURIComponent(query.trim())}`,
        );
        if (!found) {
          setState({
            status: 'error',
            error: `We could not find "${query.trim()}". Try a nearby town or district.`,
          });
          return;
        }
        setLocation(found);
        setState({ status: 'idle', error: null });
      } catch (cause) {
        setState({
          status: 'error',
          error: cause instanceof ApiRequestError ? cause.friendlyMessage : 'Location search failed.',
        });
      }
    },
    [setLocation],
  );

  return { location, setLocation, useCurrentPosition, search, ...state };
}
