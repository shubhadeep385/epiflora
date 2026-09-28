/**
 * GET /api/health — powers the provider status pill in the UI.
 *
 * Deliberately reports *configuration and budget*, never key material.
 */

import { Hono } from 'hono';
import type { HealthResponse, ProviderStatus } from '../../shared/types.ts';
import { env } from '../lib/env.ts';
import { budget } from '../lib/budget.ts';

const health = new Hono();

function status(id: string, label: string, configured: boolean): ProviderStatus {
  return { id, label, configured, ...budget.snapshot(id) };
}

health.get('/', (c) => {
  const { intelligence, voice } = env;

  const body: HealthResponse = {
    ok: true,
    version: env.version,
    demoMode: env.demoMode,
    time: new Date().toISOString(),
    intelligence: [
      status('gemini', `Gemini ${intelligence.geminiModels[0] ?? ''}`.trim(), Boolean(intelligence.geminiApiKey)),
      status('openrouter', 'OpenRouter (free models)', Boolean(intelligence.openRouterApiKey)),
      status('ollama', `Ollama ${intelligence.ollamaModel}`.trim(), Boolean(intelligence.ollamaModel)),
      status('huggingface', 'Hugging Face', Boolean(intelligence.hfToken)),
      // Demo Mode implements the same interfaces and needs no configuration,
      // which is exactly why it can be the terminal fallback.
      status('demo', 'Demo Mode', true),
    ],
    speech: [
      status('sarvam-stt', `Sarvam ${voice.sarvamSttModel}`, Boolean(voice.sarvamApiKey)),
      // Gemini accepts audio inline, so it stands in when Sarvam credit is spent.
      status('gemini-stt', 'Gemini audio', Boolean(intelligence.geminiApiKey)),
      status('browser-stt', 'Browser speech recognition', true),
    ],
    tts: [
      status('sarvam-tts', `Sarvam ${voice.sarvamTtsModel}`, Boolean(voice.sarvamApiKey)),
      status('browser-tts', 'Browser speech synthesis', true),
    ],
  };

  // Status is cheap but must never be cached by a CDN — budgets change per request.
  c.header('Cache-Control', 'no-store');
  return c.json(body);
});

export default health;
