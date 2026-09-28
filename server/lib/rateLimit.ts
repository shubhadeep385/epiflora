/**
 * In-memory sliding-window rate limiter for Hono API routes.
 *
 * Protects serverless and dev runtimes from anonymous automated scraping and
 * quota exhaustion. Tracks request timestamps per client IP.
 */

import type { Context, MiddlewareHandler } from 'hono';
import { fail } from './http.ts';

interface RateLimitOptions {
  /** Maximum requests allowed in the time window. */
  limit: number;
  /** Window duration in milliseconds. Defaults to 60,000 (1 minute). */
  windowMs?: number;
  /** Optional custom identifier extractor. */
  keyGenerator?: (c: Context) => string;
}

interface ClientRecord {
  timestamps: number[];
}

const records = new Map<string, ClientRecord>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [key, record] of records.entries()) {
    record.timestamps = record.timestamps.filter((t) => t > threshold);
    if (record.timestamps.length === 0) {
      records.delete(key);
    }
  }
}

/** Extracts client IP from standard proxy headers or Hono context. */
export function getClientIp(c: Context): string {
  const cfIp = c.req.header('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = c.req.header('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/** Normalizes request path to avoid key fragmentation across trailing slashes or cases. */
function normalizePath(rawPath: string): string {
  const clean = rawPath.split('?')[0]?.replace(/\/+$/, '') || '/';
  return clean.toLowerCase();
}

/**
 * Creates a Hono rate limiting middleware.
 */
export function rateLimiter(options: RateLimitOptions): MiddlewareHandler {
  const limit = options.limit;
  const windowMs = options.windowMs ?? 60_000;
  const keyGen = options.keyGenerator ?? getClientIp;

  return async (c, next) => {
    cleanup(windowMs);

    const now = Date.now();
    const key = `${normalizePath(c.req.path)}:${keyGen(c)}`;
    const record = records.get(key) ?? { timestamps: [] };

    // Prune timestamps older than windowMs
    record.timestamps = record.timestamps.filter((t) => t > now - windowMs);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      c.header('Retry-After', String(retryAfterSeconds));
      c.header('X-RateLimit-Limit', String(limit));
      c.header('X-RateLimit-Remaining', '0');
      return fail(c, 'quota_exhausted', 'Rate limit exceeded. Please wait a moment before trying again.');
    }

    record.timestamps.push(now);
    records.set(key, record);

    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(limit - record.timestamps.length));

    await next();
  };
}
