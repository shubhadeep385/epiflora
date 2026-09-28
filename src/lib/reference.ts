/**
 * Reference lists used across forms.
 *
 * Crops are ordered by smallholder prevalence across BRICS regions rather than
 * alphabetically, so the common cases sit near the top of the list.
 */

import type { CountryCode, GrowthStage, LanguageOption, SoilType } from '@shared/types.ts';

export const CROPS = [
  'Wheat',
  'Rice',
  'Maize',
  'Tomato',
  'Potato',
  'Cotton',
  'Sugarcane',
  'Soybean',
  'Groundnut',
  'Chickpea',
  'Mustard',
  'Onion',
  'Chilli',
  'Brinjal',
  'Okra',
  'Banana',
  'Mango',
  'Grape',
  'Coffee',
  'Tea',
  'Millet',
  'Sorghum',
  'Sunflower',
  'Cabbage',
] as const;

export const GROWTH_STAGES: Array<{ value: GrowthStage; label: string }> = [
  { value: 'sowing', label: 'Sowing' },
  { value: 'germination', label: 'Germination' },
  { value: 'vegetative', label: 'Vegetative growth' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'fruiting', label: 'Fruiting / grain fill' },
  { value: 'maturity', label: 'Maturity' },
  { value: 'harvest', label: 'Harvest' },
];

export const SOIL_TYPES: Array<{ value: SoilType; label: string }> = [
  { value: 'alluvial', label: 'Alluvial' },
  { value: 'black', label: 'Black / regur' },
  { value: 'red', label: 'Red' },
  { value: 'laterite', label: 'Laterite' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'clay', label: 'Clay' },
  { value: 'loam', label: 'Loam' },
  { value: 'silt', label: 'Silt' },
  { value: 'peat', label: 'Peat' },
  { value: 'unknown', label: 'Not sure' },
];

export const COUNTRIES: Array<{ code: CountryCode; name: string }> = [
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'AE', name: 'United Arab Emirates' },
];

/**
 * Language support, split by capability.
 *
 * Verified against Sarvam docs on 2026-08-17: Saaras v3 handles 23 languages for
 * speech recognition, but Bulbul v3 speaks 11. Where `tts` is false the answer is
 * shown as text and read by the browser voice instead, and the UI says so rather
 * than silently staying quiet.
 */
export const LANGUAGES: LanguageOption[] = [
  // BRICS Core Founding Five
  { tag: 'en-IN', nativeName: 'English', englishName: 'English (India / Global)', stt: true, tts: true },
  { tag: 'hi-IN', nativeName: 'हिन्दी', englishName: 'Hindi (India)', stt: true, tts: true },
  { tag: 'zh-CN', nativeName: '中文 (普通话)', englishName: 'Mandarin Chinese (China)', stt: true, tts: true },
  { tag: 'ru-RU', nativeName: 'Русский', englishName: 'Russian (Russia)', stt: true, tts: true },
  { tag: 'pt-BR', nativeName: 'Português', englishName: 'Portuguese (Brazil)', stt: true, tts: true },
  { tag: 'zu-ZA', nativeName: 'isiZulu', englishName: 'Zulu (South Africa)', stt: true, tts: true },

  // New Full Members (BRICS+)
  { tag: 'ar-EG', nativeName: 'العربية', englishName: 'Arabic (Egypt / Saudi Arabia / UAE)', stt: true, tts: true },
  { tag: 'fa-IR', nativeName: 'فارسی', englishName: 'Persian (Iran)', stt: true, tts: true },
  { tag: 'id-ID', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian (Indonesia)', stt: true, tts: true },
  { tag: 'am-ET', nativeName: 'አማርኛ', englishName: 'Amharic (Ethiopia)', stt: true, tts: false },

  // Partner Nations
  { tag: 'vi-VN', nativeName: 'Tiếng Việt', englishName: 'Vietnamese (Vietnam)', stt: true, tts: true },
  { tag: 'th-TH', nativeName: 'ภาษาไทย', englishName: 'Thai (Thailand)', stt: true, tts: true },

  // Regional Indic Languages
  { tag: 'bn-IN', nativeName: 'বাংলা', englishName: 'Bengali', stt: true, tts: true },
  { tag: 'mr-IN', nativeName: 'मराठी', englishName: 'Marathi', stt: true, tts: true },
  { tag: 'ta-IN', nativeName: 'தமிழ்', englishName: 'Tamil', stt: true, tts: true },
  { tag: 'te-IN', nativeName: 'తెలుగు', englishName: 'Telugu', stt: true, tts: true },
  { tag: 'kn-IN', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', stt: true, tts: true },
  { tag: 'ml-IN', nativeName: 'മലയാളം', englishName: 'Malayalam', stt: true, tts: true },
  { tag: 'gu-IN', nativeName: 'ગુજરાતી', englishName: 'Gujarati', stt: true, tts: true },
  { tag: 'pa-IN', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', stt: true, tts: true },
  { tag: 'od-IN', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', stt: true, tts: false },
];

export const DEFAULT_LANGUAGE = 'en-IN';
