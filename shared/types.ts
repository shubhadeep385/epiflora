
export type IntelligenceProviderId =
  | 'gemini'
  | 'openrouter'
  | 'ollama'
  | 'huggingface'
  | 'demo';

export type SpeechProviderId = 'sarvam' | 'gemini' | 'whisper' | 'browser';
export type TTSProviderId = 'sarvam' | 'browser';

/** Attached to every AI-derived payload so the UI can show what answered. */
export interface Provenance {
  provider: string;
  model: string;
  /** True when a fallback answered instead of the preferred provider. */
  degraded: boolean;
  latencyMs: number;
  /** True when the payload came from cache rather than a fresh call. */
  cached?: boolean;
}

/** Where a data point came from. Rendered in the UI, never hidden. */
export type DataSource = 'user' | 'sensor' | 'model' | 'demo';

export interface Sourced<T> {
  value: T;
  source: DataSource;
  unit?: string;
  observedAt?: string; // ISO 8601, UTC
}

// ─── Geography ───────────────────────────────────────────────────────────────

/** ISO 3166-1 alpha-2. Full BRICS+ sovereign federation and partner nations. */
export type CountryCode =
  | 'IN'
  | 'BR'
  | 'ZA'
  | 'CN'
  | 'RU'
  | 'EG'
  | 'ET'
  | 'IR'
  | 'SA'
  | 'AE'
  | 'ID'
  | 'BY'
  | 'BO'
  | 'CU'
  | 'KZ'
  | 'MY'
  | 'NG'
  | 'TH'
  | 'UG'
  | 'UZ'
  | 'VN'
  | (string & {});

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface LocationRef extends Partial<GeoPoint> {
  label: string; // "Pune, Maharashtra"
  region?: string;
  countryCode?: CountryCode;
}

// ─── Language ────────────────────────────────────────────────────────────────

/** BCP-47. Supports BRICS founding, full member, and partner sovereign languages. */
export type LanguageTag =
  | 'en-IN'
  | 'hi-IN'
  | 'zh-CN'
  | 'ru-RU'
  | 'pt-BR'
  | 'ar-EG'
  | 'fa-IR'
  | 'id-ID'
  | 'vi-VN'
  | 'th-TH'
  | 'am-ET'
  | 'zu-ZA'
  | 'bn-IN'
  | 'mr-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'gu-IN'
  | 'pa-IN'
  | 'od-IN'
  | (string & {});

export interface LanguageOption {
  tag: LanguageTag;
  /** Name in the language itself — farmers should recognise their own. */
  nativeName: string;
  englishName: string;
  /** Saaras v3 speech-to-text support. */
  stt: boolean;
  /** Bulbul v3 text-to-speech support. Some STT languages have no voice yet. */
  tts: boolean;
}

// ─── Crop & diagnosis ────────────────────────────────────────────────────────

export type Severity = 'low' | 'moderate' | 'high' | 'critical';

/** Lets the model refuse honestly instead of inventing a disease. */
export type ImageQuality = 'good' | 'unclear' | 'unusable';

export type GrowthStage =
  | 'sowing'
  | 'germination'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'maturity'
  | 'harvest';

export interface CropDiagnosis {
  diagnosis: string;
  /** 0-100. Model-estimated, never presented as certainty. */
  confidence: number;
  severity: Severity;
  imageQuality: ImageQuality;
  symptoms: string[];
  causes: string[];
  recommendations: string[];
  organicRemedies: string[];
  /** Named chemical classes only. Never numeric dosages. */
  chemicalOptions: string[];
  prevention: string[];
  regenerativePractices: string[];
  urgency: string;
  weatherRiskNote?: string;
  disclaimer: string;
}

// ─── Soil ────────────────────────────────────────────────────────────────────

export type NutrientLevel = 'low' | 'medium' | 'high';

export type SoilType =
  | 'alluvial'
  | 'black'
  | 'red'
  | 'laterite'
  | 'sandy'
  | 'clay'
  | 'loam'
  | 'silt'
  | 'peat'
  | 'unknown';

export interface SoilReading {
  soilType: SoilType;
  ph?: Sourced<number>;
  nitrogen?: Sourced<NutrientLevel>;
  phosphorus?: Sourced<NutrientLevel>;
  potassium?: Sourced<NutrientLevel>;
  moisturePct?: Sourced<number>;
  organicCarbonPct?: Sourced<number>;
}

export interface SoilRecommendation {
  summary: string;
  limitingFactor: string;
  recommendations: string[];
  regenerativePractices: string[];
  cautions: string[];
  disclaimer: string;
}

// ─── Weather ─────────────────────────────────────────────────────────────────

export interface WeatherNow {
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  windKph: number;
  conditionCode: number;
  conditionLabel: string;
}

export interface WeatherDay {
  date: string; // ISO date
  minC: number;
  maxC: number;
  precipitationMm: number;
  precipitationProbabilityPct: number;
  humidityPct: number;
  windKph: number;
  conditionCode: number;
  conditionLabel: string;
}

export interface WeatherSnapshot {
  location: LocationRef;
  now: WeatherNow;
  forecast: WeatherDay[];
  fetchedAt: string;
  source: DataSource;
}

export type RiskLevel = 'low' | 'elevated' | 'high';

export interface AdvisoryDay {
  date: string;
  headline: string;
  detail: string;
}

export interface Advisory {
  summary: string;
  days: AdvisoryDay[];
  irrigationGuidance: string;
  diseaseRisk: RiskLevel;
  diseaseRiskReason: string;
  regenerativePractices: string[];
  disclaimer: string;
}

// ─── Farmer & farm ───────────────────────────────────────────────────────────

export interface FarmerProfile {
  id: string;
  name?: string;
  countryCode: CountryCode;
  location: LocationRef;
  farmSizeHectares?: number;
  primaryCrop?: string;
  secondaryCrops?: string[];
  soilType?: SoilType;
  language: LanguageTag;
  createdAt: string;
  updatedAt: string;
}

/** A stored diagnosis, for Farm History. */
export interface DiagnosisRecord {
  id: string;
  createdAt: string;
  crop: string;
  location?: LocationRef;
  diagnosis: CropDiagnosis;
  provenance: Provenance;
  /** Data-URL thumbnail only. Full images are never persisted. */
  thumbnailDataUrl?: string;
}

export interface AgriAnswer {
  answer: string;
  followUps: string[];
  disclaimer: string;
}

// ─── Voice ───────────────────────────────────────────────────────────────────

export interface Transcript {
  text: string;
  language: LanguageTag;
  /** Saaras returns this only when language was auto-detected. */
  languageProbability: number | null;
}

export interface VoiceAskResult {
  transcript: Transcript;
  answer: string;
  followUps: string[];
  /** Data URL. Absent when no TTS voice exists for the language. */
  audio?: string;
  /** Set when TTS was unavailable, so the client can use browser speech. */
  speakWithBrowser?: boolean;
  diagnosis?: CropDiagnosis;
  disclaimer: string;
  provenance: {
    speech: Provenance;
    intelligence: Provenance;
    tts?: Provenance;
  };
}

// ─── Shared context injected into every agricultural prompt ──────────────────

export interface FarmContext {
  crop?: string;
  growthStage?: GrowthStage;
  location?: LocationRef;
  language?: LanguageTag;
  soil?: SoilReading;
  weather?: WeatherSnapshot;
  recentDiagnoses?: Array<Pick<DiagnosisRecord, 'createdAt' | 'crop'> & { diagnosis: string }>;
  farmSizeHectares?: number;
}

// ─── Health / status ─────────────────────────────────────────────────────────

export interface ProviderStatus {
  id: string;
  label: string;
  configured: boolean;
  /** Requests used today against DAILY_REQUEST_BUDGET. */
  used: number;
  budget: number;
  /** Set when the guard has demoted this provider for the day. */
  exhausted: boolean;
}

export interface HealthResponse {
  ok: boolean;
  version: string;
  demoMode: boolean;
  time: string;
  intelligence: ProviderStatus[];
  speech: ProviderStatus[];
  tts: ProviderStatus[];
}

// ─── API envelope ────────────────────────────────────────────────────────────

export interface ApiError {
  error: {
    /** Stable machine code. The UI maps this to farmer-friendly copy. */
    code:
      | 'invalid_request'
      | 'image_unreadable'
      | 'audio_too_long'
      | 'all_providers_failed'
      | 'quota_exhausted'
      | 'upstream_error'
      | 'not_found'
      | 'internal';
    /** Developer-facing. Never rendered raw to a farmer. */
    message: string;
    retryable: boolean;
  };
}

export type ApiResult<T> = (T & { provenance?: Provenance }) | ApiError;

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'error' in value;
}
