

import type { IntelligenceProviderId } from '../../shared/types.ts';

const str = (key: string, fallback = ''): string => process.env[key]?.trim() || fallback;

const bool = (key: string, fallback = false): boolean => {
  const raw = process.env[key]?.trim().toLowerCase();
  if (!raw) return fallback;
  return raw === 'true' || raw === '1' || raw === 'yes';
};

const int = (key: string, fallback: number): number => {
  const parsed = Number.parseInt(str(key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (key: string, fallback: string[]): string[] => {
  const raw = str(key);
  if (!raw) return fallback;
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : fallback;
};

const VALID_PROVIDERS: IntelligenceProviderId[] = [
  'gemini',
  'openrouter',
  'ollama',
  'huggingface',
  'demo',
];

const THINKING_LEVELS = ['low', 'medium', 'high'] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

function providerChain(): IntelligenceProviderId[] {
  const configured = list('AI_PROVIDER_CHAIN', ['gemini', 'openrouter', 'ollama', 'demo']);
  const chain = configured.filter((id): id is IntelligenceProviderId =>
    (VALID_PROVIDERS as string[]).includes(id),
  );
  // Demo Mode is a real provider and the last line of defence. Always terminal.
  return chain.includes('demo') ? chain : [...chain, 'demo'];
}

function thinkingLevel(): ThinkingLevel {
  const raw = str('GEMINI_THINKING_LEVEL', 'low') as ThinkingLevel;
  return THINKING_LEVELS.includes(raw) ? raw : 'low';
}

/**
 * Configuration is read lazily, on every access, rather than snapshotted at module
 * load.
 *
 * This is deliberate and was learned the hard way twice. A load-time snapshot
 * meant that ES module hoisting could evaluate this file before .env was loaded,
 * silently reporting every provider as unconfigured; and it made runtime
 * reconfiguration impossible, so fallback-chain tests couldn't sabotage a
 * provider between cases. Getters cost nothing here and remove a whole class of
 * ordering bug.
 */
export const env = {
  version: '0.1.0',
  get isProduction(): boolean {
    return str('FLORA_ENV') === 'production';
  },
  get devApiPort(): number {
    return int('API_DEV_PORT', 8787);
  },

  get demoMode(): boolean {
    return bool('DEMO_MODE', false);
  },
  get dailyRequestBudget(): number {
    return int('DAILY_REQUEST_BUDGET', 200);
  },

  intelligence: {
    get chain(): IntelligenceProviderId[] {
      return providerChain();
    },
    /**
     * Ordered Gemini preference. Google no longer publishes a fixed free-tier
     * quota table, so this is a preference list to be tuned against the real
     * limits shown in AI Studio — not a guarantee. All three verified available
     * on 2026-08-17.
     */
    get geminiModels(): string[] {
      return list('AI_MODEL_CHAIN', [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.7-flash',
      ]);
    },
    get geminiApiKey(): string {
      return str('GEMINI_API_KEY');
    },
    /** Gemini 3.x replaced thinkingBudget with this string enum. */
    get geminiThinkingLevel(): ThinkingLevel {
      return thinkingLevel();
    },

    get openRouterApiKey(): string {
      return str('OPENROUTER_API_KEY');
    },
    get openRouterFreeOnly(): boolean {
      return bool('OPENROUTER_FREE_ONLY', true);
    },

    get ollamaBaseUrl(): string {
      // In serverless / cloud deployments, localhost Ollama is absent by definition.
      if (process.env.VERCEL === '1' && !process.env.OLLAMA_BASE_URL) {
        return '';
      }
      return str('OLLAMA_BASE_URL', 'http://localhost:11434');
    },
    get ollamaModel(): string {
      return str('OLLAMA_MODEL');
    },

    get hfToken(): string {
      return str('HF_TOKEN');
    },
  },

  voice: {
    get provider(): string {
      return str('VOICE_PROVIDER', 'sarvam');
    },
    get sarvamApiKey(): string {
      return str('SARVAM_API_KEY');
    },
    get sarvamSttModel(): string {
      return str('SARVAM_STT_MODEL', 'saaras:v3');
    },
    /** codemix by default: farmers mix Hindi and English mid-sentence. */
    get sarvamSttMode(): string {
      return str('SARVAM_STT_MODE', 'codemix');
    },
    get sarvamTtsModel(): string {
      return str('SARVAM_TTS_MODEL', 'bulbul:v3');
    },
  },

  weather: {
    get openMeteoBaseUrl(): string {
      return str('OPEN_METEO_BASE_URL', 'https://api.open-meteo.com');
    },
  },
} as const;

/** Hard provider limits, from vendor docs verified 2026-08-17. */
export const LIMITS = {
  /** Saaras v3 real-time REST rejects audio longer than 30s. Cap below it. */
  maxRecordingSeconds: 25,
  /** Bulbul v3 accepts 2500 chars per request, so answers get chunked. */
  ttsMaxChars: 2500,
  /** Keep farmer-facing answers short enough for one comfortable TTS pass. */
  answerTargetChars: 900,
  /** Client downscales before upload; this is the server-side backstop. */
  maxImageBytes: 6 * 1024 * 1024,
  maxAudioBytes: 10 * 1024 * 1024,
} as const;
