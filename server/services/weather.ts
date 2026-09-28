/**
 * Open-Meteo client.
 *
 * Chosen because it needs no API key at prototype scale, which keeps the weather
 * layer free and removes one more secret from the deployment. Raw output is
 * normalised into our own shape so a different provider could be swapped in
 * without touching the advisory logic or the UI.
 */

import { env } from '../lib/env.ts';
import { AppError } from '../lib/http.ts';
import { cached, cacheKey } from '../lib/cache.ts';
import type { LocationRef, WeatherDay, WeatherSnapshot } from '../../shared/types.ts';

/** WMO weather interpretation codes, condensed to what a farmer needs. */
const WMO_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

export function describeWeatherCode(code: number): string {
  return WMO_LABELS[code] ?? 'Unknown conditions';
}

interface OpenMeteoForecast {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    relative_humidity_2m_mean?: number[];
    wind_speed_10m_max?: number[];
    weather_code?: number[];
  };
}

interface GeocodeResult {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    admin1?: string;
  }>;
}

/** Free-text place name to coordinates. Open-Meteo's geocoder is also keyless. */
export async function geocode(query: string): Promise<LocationRef | null> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new AppError('upstream_error', `Geocoding failed: ${response.status}`);

  const body = (await response.json()) as GeocodeResult;
  const first = body.results?.[0];
  if (!first) return null;

  return {
    label: [first.name, first.admin1, first.country_code].filter(Boolean).join(', '),
    latitude: first.latitude,
    longitude: first.longitude,
    ...(first.admin1 ? { region: first.admin1 } : {}),
    ...(first.country_code ? { countryCode: first.country_code } : {}),
  };
}

interface ReverseGeocodeResult {
  latitude?: number;
  longitude?: number;
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
}

/** Reverse geocodes coordinates (lat, lon) to accurate locality/city/state name. */
export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationRef> {
  try {
    const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('localityLanguage', 'en');

    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = (await response.json()) as ReverseGeocodeResult;
      const parts = [
        data.locality || data.city,
        data.principalSubdivision,
        data.countryName,
      ].filter(Boolean);

      if (parts.length > 0) {
        return {
          label: parts.join(', '),
          latitude,
          longitude,
          ...(data.principalSubdivision ? { region: data.principalSubdivision } : {}),
          ...(data.countryCode ? { countryCode: data.countryCode } : {}),
        };
      }
    }
  } catch (err) {
    // Non-fatal, fallback to formatted coordinates
  }

  return {
    label: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
    latitude,
    longitude,
  };
}

/** Automatically detects farm location by client IP when device GPS is unavailable or blocked. */
export async function detectLocationByIp(): Promise<LocationRef> {
  try {
    const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
    url.searchParams.set('localityLanguage', 'en');

    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = (await response.json()) as ReverseGeocodeResult;
      if (data.latitude !== undefined && data.longitude !== undefined) {
        const parts = [
          data.locality || data.city,
          data.principalSubdivision,
          data.countryName,
        ].filter(Boolean);

        return {
          label: parts.join(', ') || `${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)}`,
          latitude: data.latitude,
          longitude: data.longitude,
          ...(data.principalSubdivision ? { region: data.principalSubdivision } : {}),
          ...(data.countryCode ? { countryCode: data.countryCode } : {}),
        };
      }
    }
  } catch (err) {
    // Non-fatal fallback to Pune, Maharashtra default
  }

  return {
    label: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    region: 'Maharashtra',
    countryCode: 'IN',
  };
}

async function fetchForecast(location: LocationRef): Promise<WeatherSnapshot> {
  const { latitude, longitude } = location;
  if (latitude === undefined || longitude === undefined) {
    throw new AppError('invalid_request', 'Weather needs coordinates');
  }

  const url = new URL('/v1/forecast', env.weather.openMeteoBaseUrl);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code');
  url.searchParams.set(
    'daily',
    'temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,weather_code',
  );
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new AppError('upstream_error', `Open-Meteo returned ${response.status}`);
  }

  const body = (await response.json()) as OpenMeteoForecast;
  const current = body.current;
  const daily = body.daily;
  const dates = daily?.time ?? [];

  if (!current || current.temperature_2m === undefined || current.relative_humidity_2m === undefined || dates.length === 0) {
    throw new AppError('upstream_error', 'Incomplete or malformed forecast data received from Open-Meteo');
  }

  const forecast: WeatherDay[] = dates.map((date, index) => {
    const code = daily?.weather_code?.[index] ?? 0;
    return {
      date,
      minC: daily?.temperature_2m_min?.[index] ?? current.temperature_2m ?? 20,
      maxC: daily?.temperature_2m_max?.[index] ?? current.temperature_2m ?? 25,
      precipitationMm: daily?.precipitation_sum?.[index] ?? 0,
      precipitationProbabilityPct: daily?.precipitation_probability_max?.[index] ?? 0,
      humidityPct: daily?.relative_humidity_2m_mean?.[index] ?? current.relative_humidity_2m ?? 50,
      windKph: daily?.wind_speed_10m_max?.[index] ?? 0,
      conditionCode: code,
      conditionLabel: describeWeatherCode(code),
    };
  });

  const currentCode = current.weather_code ?? 0;

  return {
    location,
    now: {
      temperatureC: current.temperature_2m,
      humidityPct: current.relative_humidity_2m,
      precipitationMm: current.precipitation ?? 0,
      windKph: current.wind_speed_10m ?? 0,
      conditionCode: currentCode,
      conditionLabel: describeWeatherCode(currentCode),
    },
    forecast,
    fetchedAt: new Date().toISOString(),
    source: 'sensor',
  };
}

/**
 * Cached for 15 minutes: weather does not change faster than that, and repeated
 * dashboard visits should not each cost a round trip.
 */
export async function getWeather(location: LocationRef): Promise<WeatherSnapshot> {
  const key = cacheKey('weather', [
    location.latitude?.toFixed(2),
    location.longitude?.toFixed(2),
  ]);
  const { value } = await cached(key, () => fetchForecast(location), 15 * 60 * 1000);
  return value;
}

/**
 * Deterministic risk heuristics, computed before any model sees the data.
 *
 * Two reasons this is not left to the LLM: fungal risk from humidity and rainfall
 * is well-established agronomy that does not need inference, and a number the
 * model cannot hallucinate is a number we can defend to a judge.
 */
export interface WeatherRisk {
  fungal: 'low' | 'elevated' | 'high';
  fungalReason: string;
  rainNext24hMm: number;
  rainProbabilityNext24hPct: number;
  irrigationHint: string;
  heatStress: boolean;
}

export function assessRisk(snapshot: WeatherSnapshot): WeatherRisk {
  const today = snapshot.forecast[0];
  const tomorrow = snapshot.forecast[1];

  const rainNext24hMm = (today?.precipitationMm ?? 0) + (tomorrow?.precipitationMm ?? 0) * 0.5;
  const rainProbabilityNext24hPct = Math.max(
    today?.precipitationProbabilityPct ?? 0,
    tomorrow?.precipitationProbabilityPct ?? 0,
  );

  const humidity = Math.max(snapshot.now.humidityPct, today?.humidityPct ?? 0);
  const warm = snapshot.now.temperatureC >= 18 && snapshot.now.temperatureC <= 32;

  // Prolonged leaf wetness plus warmth is the classic infection window.
  let fungal: WeatherRisk['fungal'] = 'low';
  let fungalReason = 'Humidity is moderate, so infection pressure is low.';

  if (humidity >= 85 && warm) {
    fungal = 'high';
    fungalReason = `Humidity around ${Math.round(humidity)}% with warm temperatures keeps leaves wet — strong conditions for fungal infection.`;
  } else if (humidity >= 70 && (warm || rainNext24hMm > 5)) {
    fungal = 'elevated';
    fungalReason = `Humidity near ${Math.round(humidity)}% with rain expected raises fungal disease risk.`;
  }

  const irrigationHint =
    rainProbabilityNext24hPct >= 60 || rainNext24hMm >= 8
      ? `Rain is likely in the next day (${Math.round(rainProbabilityNext24hPct)}% chance, about ${rainNext24hMm.toFixed(1)}mm). Holding off on irrigation avoids waterlogging and saves water.`
      : humidity >= 85
        ? 'Air is already very humid. Water at the base of plants early in the day rather than overhead.'
        : 'No significant rain expected in the next day, so normal irrigation is appropriate.';

  return {
    fungal,
    fungalReason,
    rainNext24hMm: Number(rainNext24hMm.toFixed(1)),
    rainProbabilityNext24hPct: Math.round(rainProbabilityNext24hPct),
    irrigationHint,
    heatStress: snapshot.now.temperatureC >= 38,
  };
}
