/**
 * Local API server. Vite proxies /api here, so dev and prod exercise the same
 * Hono app over real HTTP — no mock layer to drift out of sync.
 */

// MUST be first: populates process.env before any module reads configuration.
// See lib/loadEnv.ts for why this cannot be a plain function call below.
import './lib/loadEnv.ts';

import { serve } from '@hono/node-server';
import app from './index.ts';
import { env } from './lib/env.ts';
import { log } from './lib/logger.ts';

serve({ fetch: app.fetch, port: env.devApiPort }, (info) => {
  log.info('EpiFlora API listening', {
    url: `http://localhost:${info.port}/api/health`,
    demoMode: env.demoMode,
    // Presence only, never values.
    configured: {
      gemini: Boolean(env.intelligence.geminiApiKey),
      openrouter: Boolean(env.intelligence.openRouterApiKey),
      sarvam: Boolean(env.voice.sarvamApiKey),
      ollama: Boolean(env.intelligence.ollamaModel),
    },
  });
});
