import { useState } from 'react';
import { UserRound, Check, Trash2, ShieldCheck } from 'lucide-react';
import { Card, SectionHeading } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { LanguagePicker } from '../../components/voice/LanguagePicker.tsx';
import { LocationPicker } from '../../components/weather/LocationPicker.tsx';
import { CROPS } from '../../lib/reference.ts';
import { useAppStore } from '../../store/appStore.ts';

const LABEL = 'block text-sm font-medium text-forest-800';
const CONTROL =
  'mt-1.5 min-h-11 w-full rounded-xl border border-hairline bg-surface px-3 text-base text-ink focus:border-forest-400';

/**
 * Lightweight farm details.
 *
 * No account, no sign-in (Phase 1 §17): everything lives in localStorage on the
 * farmer's own device. That is a privacy position as much as a scoping decision —
 * a smallholder should not have to hand over identity to get a crop diagnosis.
 */
export function ProfilePage() {
  const primaryCrop = useAppStore((store) => store.primaryCrop);
  const setPrimaryCrop = useAppStore((store) => store.setPrimaryCrop);
  const history = useAppStore((store) => store.history);
  const clearHistory = useAppStore((store) => store.clearHistory);
  const soil = useAppStore((store) => store.soil);
  const setSoil = useAppStore((store) => store.setSoil);

  const [crop, setCrop] = useState(primaryCrop ?? '');
  const [saved, setSaved] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  function save(event: React.FormEvent) {
    event.preventDefault();
    setPrimaryCrop(crop.trim() || null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <SectionHeading
        as="h1"
        icon={UserRound}
        title="Your farm"
        description="Used to make every answer specific to your crop and conditions."
      />

      <form onSubmit={save}>
        <Card className="p-5 sm:p-6">
          <label htmlFor="primaryCrop" className={LABEL}>
            Main crop
          </label>
          <input
            id="primaryCrop"
            list="profile-crops"
            value={crop}
            onChange={(event) => setCrop(event.target.value)}
            placeholder="Start typing, or choose from the list"
            className={CONTROL}
          />
          <datalist id="profile-crops">
            {CROPS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <p className="mt-2 text-xs text-ink-subtle">
            Applied automatically in Crop Doctor, weather advisories and voice answers.
          </p>

          <Button type="submit" className="mt-5">
            {saved ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Saved
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Card>
      </form>

      <LocationPicker />

      <Card className="p-5 sm:p-6">
        <LanguagePicker />
      </Card>

      {/* Data controls — visible, not buried. */}
      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold text-forest-800">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Your data
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Your farm details, soil values and crop check history are stored only in this browser.
          Crop photos are analysed and discarded — only small thumbnails are kept for your history.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-subtle">Crop checks saved</dt>
            <dd className="font-medium text-forest-800">{history.length}</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Soil values</dt>
            <dd className="font-medium text-forest-800">{soil ? 'Recorded' : 'None'}</dd>
          </div>
        </dl>

        {(history.length > 0 || soil) && (
          <div className="mt-5 border-t border-hairline pt-5">
            {confirmingClear ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-clay-700">
                  Delete all crop checks and soil values from this device?
                </p>
                <Button
                  variant="danger"
                  onClick={() => {
                    clearHistory();
                    setSoil(null);
                    setConfirmingClear(false);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete everything
                </Button>
                <Button variant="ghost" onClick={() => setConfirmingClear(false)}>
                  Keep it
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmingClear(true)}>
                <Trash2 className="size-4" aria-hidden="true" />
                Clear my saved data
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
