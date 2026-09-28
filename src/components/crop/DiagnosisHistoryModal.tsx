import { useNavigate } from 'react-router-dom';
import type { DiagnosisRecord } from '@shared/types.ts';
import {
  X,
  Leaf,
  AlertTriangle,
  ShieldCheck,
  Sprout,
  Mic,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore.ts';

interface DiagnosisHistoryModalProps {
  record: DiagnosisRecord | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const SEVERITY_BADGE = {
  low: 'bg-[#E9FFEC] text-[#0F3D2E] dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/20',
  moderate: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/20',
  high: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-rose-950/60 dark:text-rose-300 border-rose-500/20',
  critical: 'bg-[#7F1D1D] text-white dark:bg-red-900 dark:text-red-100 border-red-500/30',
} as const;

export function DiagnosisHistoryModal({ record, onClose, onDelete }: DiagnosisHistoryModalProps) {
  const navigate = useNavigate();
  const setPendingVoiceImage = useAppStore((state) => state.setPendingVoiceImage);

  if (!record) return null;

  const { diagnosis, provenance, crop, createdAt, thumbnailDataUrl } = record;

  const handleAskVoiceCopilot = () => {
    if (thumbnailDataUrl) {
      setPendingVoiceImage(thumbnailDataUrl);
    }
    onClose();
    navigate('/ask');
  };

  const handleDiagnoseNew = () => {
    onClose();
    navigate('/diagnose');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0A1C14] text-[#0F3D2E] dark:text-[#FAF8F3] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 bg-white/90 dark:bg-[#0A1C14]/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E9FFEC] dark:bg-[#0E241B] text-[#0F3D2E] dark:text-[#2AD58B]">
              <Leaf className="h-4 w-4" />
            </span>
            <div>
              <h2 id="history-modal-title" className="font-serif text-lg font-bold">
                Crop Check Details
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-[#4F6355] dark:text-emerald-100/60">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#4F6355] hover:bg-[#FAF8F3] hover:text-[#0F3D2E] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Banner Card: Image & Diagnosis Overview */}
          <div className="flex flex-col sm:flex-row gap-5 items-start rounded-2xl bg-[#FCF9F0] dark:bg-[#0E221A] p-5 border border-[#0F3D2E]/8 dark:border-white/10">
            {thumbnailDataUrl ? (
              <img
                src={thumbnailDataUrl}
                alt={`Photo of ${crop} check`}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl object-cover shrink-0 border border-[#0F3D2E]/10 dark:border-white/10 shadow-sm"
              />
            ) : (
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl bg-white dark:bg-black/20 flex flex-col items-center justify-center text-[#4F6355] dark:text-white/50 shrink-0 border border-[#0F3D2E]/10 dark:border-white/10">
                <Leaf className="h-8 w-8 mb-1 text-[#22C55E]" />
                <span className="text-[10px] font-mono">No Image</span>
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#8C6A4D] dark:text-[#d9f99d]">
                  {crop}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                    SEVERITY_BADGE[diagnosis.severity] || SEVERITY_BADGE.moderate
                  }`}
                >
                  {diagnosis.severity} Severity
                </span>
                <span className="rounded-full bg-white dark:bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4F6355] dark:text-white/80 border border-[#0F3D2E]/8 dark:border-white/10">
                  {Math.round(diagnosis.confidence)}% Confidence
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F3D2E] dark:text-white leading-snug">
                {diagnosis.diagnosis}
              </h3>

              {diagnosis.urgency && (
                <div className="flex items-start gap-1.5 text-xs text-[#92400E] dark:text-amber-300 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{diagnosis.urgency}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Recommendations / Next Actions */}
          {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
            <div className="rounded-2xl border border-[#0F3D2E]/10 dark:border-white/10 bg-white dark:bg-[#0E221A] p-5">
              <h4 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E] dark:text-[#2AD58B]">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
                <span>Immediate Action Steps</span>
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-[#374B3E] dark:text-emerald-100/90 leading-relaxed">
                {diagnosis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] mt-2 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Organic Remedies & Treatments */}
          {diagnosis.organicRemedies && diagnosis.organicRemedies.length > 0 && (
            <div className="rounded-2xl border border-[#22C55E]/30 dark:border-[#2AD58B]/30 bg-[#E9FFEC]/40 dark:bg-emerald-950/20 p-5">
              <h4 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E] dark:text-[#2AD58B]">
                <ShieldCheck className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
                <span>Organic & Biological Solutions</span>
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-[#374B3E] dark:text-emerald-100/90 leading-relaxed">
                {diagnosis.organicRemedies.map((remedy, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] mt-2 shrink-0" />
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Symptoms Identified */}
          {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
            <div className="rounded-2xl border border-[#0F3D2E]/8 dark:border-white/10 bg-[#FCF9F0] dark:bg-[#132C22] p-5">
              <h4 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#4F6355] dark:text-emerald-100/70">
                <HelpCircle className="h-4 w-4 text-[#8C6A4D] dark:text-amber-400" />
                <span>Symptoms Observed</span>
              </h4>
              <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-[#4F6355] dark:text-emerald-100/80">
                {diagnosis.symptoms.map((symptom, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#8C6A4D] dark:bg-amber-400 mt-2 shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Regenerative Soil & Long-Term Prevention */}
          {diagnosis.regenerativePractices && diagnosis.regenerativePractices.length > 0 && (
            <div className="rounded-2xl border border-[#0F3D2E]/8 dark:border-white/10 bg-[#FCF9F0] dark:bg-[#132C22] p-5">
              <h4 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E] dark:text-[#FAF8F3]">
                <Sprout className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
                <span>Regenerative Soil & Crop Prevention</span>
              </h4>
              <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-[#4F6355] dark:text-emerald-100/80">
                {diagnosis.regenerativePractices.map((prac, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] mt-2 shrink-0" />
                    <span>{prac}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Provenance AI Footnote */}
          {provenance && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white dark:bg-black/20 p-3.5 border border-[#0F3D2E]/8 dark:border-white/5 font-mono text-[11px] text-[#4F6355] dark:text-white/60">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
                <span>Model: {provenance.model || provenance.provider}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Response: {provenance.latencyMs}ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#0A1C14] px-6 py-4">
          {onDelete && (
            <button
              onClick={() => onDelete(record.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Check</span>
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleAskVoiceCopilot}
              className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/20 bg-white dark:bg-[#0E221A] px-4 py-2 text-xs font-semibold text-[#0F3D2E] dark:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#132C22] transition-colors cursor-pointer shadow-xs"
            >
              <Mic className="h-3.5 w-3.5 text-[#C2703F] dark:text-[#d9f99d]" />
              <span>Ask Voice Copilot</span>
            </button>

            <button
              onClick={handleDiagnoseNew}
              className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] text-white dark:bg-[#2AD58B] dark:text-[#07130E] px-5 py-2 text-xs font-bold hover:bg-[#175440] dark:hover:bg-[#34e095] transition-all cursor-pointer shadow-sm"
            >
              <Leaf className="h-3.5 w-3.5" />
              <span>Diagnose Leaf</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
