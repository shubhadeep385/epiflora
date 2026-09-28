import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Stethoscope, AlertCircle, History, ChevronRight } from 'lucide-react';
import type { GrowthStage, DiagnosisRecord } from '@shared/types.ts';
import { Card, SectionHeading } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ImagePicker } from '../../components/crop/ImagePicker.tsx';
import { AnalysisProgress } from '../../components/crop/AnalysisProgress.tsx';
import { DiagnosisResult } from '../../components/crop/DiagnosisResult.tsx';
import { DiagnosisHistoryModal } from '../../components/crop/DiagnosisHistoryModal.tsx';
import { useDiagnosis } from '../../hooks/useDiagnosis.ts';
import { useAppStore } from '../../store/appStore.ts';
import { CROPS, GROWTH_STAGES } from '../../lib/reference.ts';
import type { PreparedImage } from '../../lib/image.ts';

const FIELD_LABEL = 'block text-sm font-medium text-forest-800';
const FIELD_CONTROL =
  'mt-1.5 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-base text-ink transition-colors focus:border-forest-400';

export function CropDoctorPage() {
  const navigate = useNavigate();
  const storedCrop = useAppStore((store) => store.primaryCrop);
  const location = useAppStore((store) => store.location);
  const history = useAppStore((store) => store.history);
  const removeDiagnosis = useAppStore((store) => store.removeDiagnosis);
  const setPendingVoiceImage = useAppStore((store) => store.setPendingVoiceImage);
  const setPrimaryCrop = useAppStore((store) => store.setPrimaryCrop);

  const [image, setImage] = useState<PreparedImage | null>(null);
  const [crop, setCrop] = useState(storedCrop ?? '');
  const [growthStage, setGrowthStage] = useState<GrowthStage | ''>('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<DiagnosisRecord | null>(null);

  const { status, stage, result, error, run, reset } = useDiagnosis();

  const canSubmit = Boolean(image) && crop.trim().length > 0 && status !== 'running';

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!image || !canSubmit) return;
    void run({
      image: image.dataUrl,
      crop,
      ...(symptoms.trim() ? { symptoms } : {}),
      ...(growthStage ? { growthStage } : {}),
      location,
    });
  }

  function startOver() {
    reset();
    setImage(null);
    setSymptoms('');
  }

  /**
   * Carries this photo into the Voice Copilot. Remembering the crop too means the
   * spoken answer keeps the same context the diagnosis had.
   */
  function askAboutPhoto() {
    if (!image) return;
    setPendingVoiceImage(image.dataUrl);
    if (crop.trim()) setPrimaryCrop(crop.trim());
    navigate('/ask');
  }

  return (
    <div className="max-w-3xl">
      <SectionHeading
        as="h1"
        icon={Stethoscope}
        title="Crop Doctor"
        description="Photograph an affected leaf for a likely diagnosis, severity and practical next steps."
      />

      {status === 'done' && result ? (
        <DiagnosisResult
          diagnosis={result.diagnosis}
          provenance={result.provenance}
          onStartOver={startOver}
          {...(image ? { onAskAboutPhoto: askAboutPhoto } : {})}
        />
      ) : status === 'running' ? (
        <AnalysisProgress stage={stage} />
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Card className="p-5 sm:p-6">
            <ImagePicker image={image} onChange={setImage} />
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="crop" className={FIELD_LABEL}>
                  Crop <span className="text-risk-high">*</span>
                </label>
                {/* A list rather than a locked select: local crop names matter and
                    the list can never be complete. */}
                <input
                  id="crop"
                  list="crop-options"
                  value={crop}
                  onChange={(event) => setCrop(event.target.value)}
                  placeholder="Start typing, or choose from the list"
                  required
                  className={FIELD_CONTROL}
                />
                <datalist id="crop-options">
                  {CROPS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="stage" className={FIELD_LABEL}>
                  Growth stage <span className="font-normal text-ink-subtle">(optional)</span>
                </label>
                <select
                  id="stage"
                  value={growthStage}
                  onChange={(event) => setGrowthStage(event.target.value as GrowthStage | '')}
                  className={FIELD_CONTROL}
                >
                  <option value="">Not sure</option>
                  {GROWTH_STAGES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="symptoms" className={FIELD_LABEL}>
                What are you noticing?{' '}
                <span className="font-normal text-ink-subtle">(optional)</span>
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                rows={3}
                maxLength={600}
                placeholder="For example: lower leaves yellowing over the past week, worse after rain"
                className={`${FIELD_CONTROL} min-h-24 resize-y py-2.5 leading-relaxed`}
              />
              <p className="mt-1.5 text-xs text-ink-subtle">
                Your description often matters as much as the photo.
              </p>
            </div>

            {location?.label && (
              <p className="text-xs text-ink-subtle">
                Using your saved location: {location.label}
              </p>
            )}
          </Card>

          {error && (
            <div
              role="alert"
              className="flex gap-3 rounded-card border border-clay-300 bg-clay-100 p-4"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-clay-700" aria-hidden="true" />
              <div className="text-sm text-clay-700">
                <p>{error.message}</p>
                {error.retryable && (
                  <p className="mt-1 text-clay-700/80">
                    Your photo and details are still here — press diagnose to try again.
                  </p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" size="lg" fullWidth disabled={!canSubmit}>
            <Leaf className="size-5" aria-hidden="true" />
            Diagnose crop
          </Button>

          <p className="text-center text-xs text-ink-subtle">
            EpiFlora gives an AI assessment, not a confirmed diagnosis. For severe or spreading
            damage, consult a local agricultural expert.
          </p>

          {/* Past Crop Checks History Quick Access */}
          {history.length > 0 && (
            <Card className="overflow-hidden mt-8">
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-forest-600 dark:text-[#2AD58B]" />
                  <h3 className="font-semibold text-forest-800 dark:text-[#FAF8F3] text-sm">
                    Recent Checks on This Device
                  </h3>
                </div>
                <span className="text-xs text-ink-subtle font-mono">{history.length} saved</span>
              </div>

              <ul className="divide-y divide-hairline border-t border-hairline">
                {history.slice(0, 4).map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedHistoryRecord(record)}
                      className="group flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-forest-50/60 dark:hover:bg-[#0E241B] cursor-pointer"
                    >
                      {record.thumbnailDataUrl ? (
                        <img
                          src={record.thumbnailDataUrl}
                          alt=""
                          className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-forest-900/10 dark:ring-white/10"
                        />
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Leaf className="size-4" aria-hidden="true" />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-forest-800 dark:text-[#FAF8F3] group-hover:text-forest-600 dark:group-hover:text-[#2AD58B] transition-colors">
                          {record.diagnosis.diagnosis}
                        </p>
                        <p className="text-xs text-ink-subtle">
                          {record.crop} ·{' '}
                          {new Date(record.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            record.diagnosis.severity === 'low'
                              ? 'bg-forest-50 text-risk-low dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-clay-100 text-risk-elevated dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {record.diagnosis.severity}
                        </span>
                        <ChevronRight className="size-4 text-ink-subtle group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </form>
      )}

      {/* History Detail Modal */}
      <DiagnosisHistoryModal
        record={selectedHistoryRecord}
        onClose={() => setSelectedHistoryRecord(null)}
        onDelete={(id) => {
          removeDiagnosis(id);
          setSelectedHistoryRecord(null);
        }}
      />
    </div>
  );
}
