

import { isApiError, type ApiError, type HealthResponse } from '@shared/types.ts';

/** Farmer-facing copy per error code. Never show a raw provider message. */
const FRIENDLY: Record<ApiError['error']['code'], string> = {
  invalid_request: 'Some details were missing. Please check the form and try again.',
  image_unreadable:
    "We couldn't read that image. Try a clearer photo of the leaf in natural light.",
  audio_too_long: 'That recording was too long. Please keep your question under 25 seconds.',
  all_providers_failed: 'AI services are busy right now. Demo results are available meanwhile.',
  quota_exhausted: 'AI service temporarily unavailable. Switching to backup intelligence…',
  upstream_error: 'A service took too long to respond. Please try once more.',
  not_found: 'That feature is not available yet.',
  internal: 'Something went wrong on our side. Please try again.',
};

export class ApiRequestError extends Error {
  readonly code: ApiError['error']['code'];
  readonly retryable: boolean;
  /** Safe to render directly to a farmer. */
  readonly friendlyMessage: string;

  constructor(payload: ApiError) {
    super(payload.error.message);
    this.name = 'ApiRequestError';
    this.code = payload.error.code;
    this.retryable = payload.error.retryable;
    this.friendlyMessage = FRIENDLY[payload.error.code] ?? FRIENDLY.internal;
  }
}

const OFFLINE: ApiError = {
  error: {
    code: 'upstream_error',
    message: 'Network request failed',
    retryable: true,
  },
};

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    });
  } catch (cause) {
    throw new ApiRequestError({
      error: { ...OFFLINE.error, message: `Network request failed: ${String(cause)}` },
    });
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiError(payload)) throw new ApiRequestError(payload);
    throw new ApiRequestError({
      error: {
        code: 'internal',
        message: `Unexpected ${response.status} from ${path}`,
        retryable: true,
      },
    });
  }

  return payload as T;
}

export const api = {
  health: () => request<HealthResponse>('/health'),

  get: <T>(path: string) => request<T>(path),

  postJson: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};
