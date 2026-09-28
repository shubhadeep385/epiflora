/**
 * The EpiFlora API — one Hono app, two runtimes.
 *
 *   dev  → server/dev.ts serves it on :8787, Vite proxies /api to it
 *   prod → api/[...route].ts re-exports it as a single Vercel function
 *
 * This is the seam that keeps API keys out of the browser without dragging in a
 * second framework. Handlers are written once.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as requestLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { fail, handleError } from './lib/http.ts';
import { log } from './lib/logger.ts';
import { rateLimiter } from './lib/rateLimit.ts';
import health from './routes/health.ts';
import ai from './routes/ai.ts';
import weather from './routes/weather.ts';
import voiceRoutes from './routes/voice.ts';

const app = new Hono().basePath('/api');

app.use('*', secureHeaders());

// CORS configuration — permit same-origin and dev server proxies
app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

// Rate limiting: protects unauthenticated endpoints from abusive load
app.use('/ai/*', rateLimiter({ limit: 30, windowMs: 60_000 }));
app.use('/voice/*', rateLimiter({ limit: 15, windowMs: 60_000 }));
app.use('/weather/*', rateLimiter({ limit: 60, windowMs: 60_000 }));

// Request-line logging only. Bodies carry crop photos, GPS and audio.
app.use('*', requestLogger((message) => log.debug(message.trim())));

app.route('/health', health);
app.route('/ai', ai);
app.route('/weather', weather);
app.route('/voice', voiceRoutes);

app.notFound((c) => fail(c, 'not_found', `No API route for ${c.req.method} ${c.req.path}`));
app.onError(handleError);

export default app;
