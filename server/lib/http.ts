/**
 * HTTP helpers shared by every route.
 *
 * Farmers never see these messages. The client maps `code` to friendly copy, so
 * `message` stays developer-facing and detailed.
 */

import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiError } from '../../shared/types.ts';
import { env } from './env.ts';
import { log, describeError } from './logger.ts';

type ErrorCode = ApiError['error']['code'];

const STATUS: Record<ErrorCode, ContentfulStatusCode> = {
  invalid_request: 400,
  image_unreadable: 422,
  audio_too_long: 413,
  all_providers_failed: 503,
  quota_exhausted: 429,
  upstream_error: 502,
  not_found: 404,
  internal: 500,
};

const RETRYABLE: Record<ErrorCode, boolean> = {
  invalid_request: false,
  image_unreadable: false,
  audio_too_long: false,
  all_providers_failed: true,
  quota_exhausted: true,
  upstream_error: true,
  not_found: false,
  internal: true,
};

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}

export function fail(c: Context, code: ErrorCode, message: string) {
  const body: ApiError = { error: { code, message, retryable: RETRYABLE[code] } };
  return c.json(body, STATUS[code]);
}

/** Terminal error handler for the Hono app. */
export function handleError(cause: unknown, c: Context) {
  if (cause instanceof AppError) {
    log.warn('request failed', { code: cause.code, message: cause.message, path: c.req.path });
    return fail(c, cause.code, cause.message);
  }
  const described = describeError(cause);
  log.error('unhandled request error', { ...described, path: c.req.path });
  const message = env.isProduction ? 'An internal error occurred. Please try again.' : described.message;
  return fail(c, 'internal', message);
}

/**
 * Races a promise against a deadline. Used to demote a slow provider rather than
 * leaving a farmer staring at a spinner.
 */
export async function withTimeout<T>(
  work: (signal: AbortSignal) => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await work(controller.signal);
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new AppError('upstream_error', `${label} timed out after ${ms}ms`, { cause });
    }
    throw cause;
  } finally {
    clearTimeout(timer);
  }
}
