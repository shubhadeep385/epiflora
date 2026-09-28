/**
 * Vercel entry point. The catch-all rewrite in vercel.json funnels every /api/*
 * request into this single function, which delegates to the same Hono app used
 * in local development.
 */

import app from '../server/index.ts';

export const config = { runtime: 'nodejs' };
export const maxDuration = 30;

export default function handler(request: Request): Response | Promise<Response> {
  return app.fetch(request);
}
