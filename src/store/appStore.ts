/**
 * Local farm state.
 *
 * localStorage on purpose (Phase 1 §43): no account, no cloud database, no
 * hackathon time spent on infrastructure. The shapes are the normalised shared
 * entities, so swapping in a real DataStore later is a swap, not a rewrite.
 *
 * Privacy: crop photos are never persisted, only small thumbnails for history.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CropDiagnosis,
  DiagnosisRecord,
  LanguageTag,
  LocationRef,
  Provenance,
  SoilReading,
} from '@shared/types.ts';
import { DEFAULT_LANGUAGE } from '../lib/reference.ts';

/** Farm history is capped: localStorage is small and old checks lose relevance. */
const MAX_HISTORY = 20;

interface AppState {
  language: LanguageTag;
  location: LocationRef | null;
  primaryCrop: string | null;
  soil: SoilReading | null;
  history: DiagnosisRecord[];

  /**
   * A photo handed from Crop Doctor to the Voice Copilot, so "diagnose this" and
   * "now let me ask about it" are one continuous flow rather than two uploads.
   * Deliberately excluded from persistence: full images are never written to disk.
   */
  pendingVoiceImage: string | null;

  setLanguage: (language: LanguageTag) => void;
  setLocation: (location: LocationRef | null) => void;
  setPrimaryCrop: (crop: string | null) => void;
  setSoil: (soil: SoilReading | null) => void;
  setPendingVoiceImage: (dataUrl: string | null) => void;

  addDiagnosis: (entry: {
    crop: string;
    diagnosis: CropDiagnosis;
    provenance: Provenance;
    thumbnailDataUrl?: string;
    location?: LocationRef | null;
  }) => void;
  removeDiagnosis: (id: string) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      location: null,
      primaryCrop: null,
      soil: null,
      history: [],
      pendingVoiceImage: null,

      setLanguage: (language) => set({ language }),
      setLocation: (location) => set({ location }),
      setPrimaryCrop: (primaryCrop) => set({ primaryCrop }),
      setSoil: (soil) => set({ soil }),
      setPendingVoiceImage: (pendingVoiceImage) => set({ pendingVoiceImage }),

      addDiagnosis: ({ crop, diagnosis, provenance, thumbnailDataUrl, location }) =>
        set((state) => {
          const record: DiagnosisRecord = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            crop,
            diagnosis,
            provenance,
            ...(thumbnailDataUrl ? { thumbnailDataUrl } : {}),
            ...(location ? { location } : {}),
          };
          return { history: [record, ...state.history].slice(0, MAX_HISTORY) };
        }),

      removeDiagnosis: (id) =>
        set((state) => ({
          history: state.history.filter((record) => record.id !== id),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'epiflora.farm.v1',
      version: 1,
      // Only durable farm facts are persisted.
      partialize: (state) => ({
        language: state.language,
        location: state.location,
        primaryCrop: state.primaryCrop,
        soil: state.soil,
        history: state.history,
      }),
    },
  ),
);
