import { Droplets, Sprout, Loader2, AlertCircle } from 'lucide-react';
import type { Advisory, Provenance } from '@shared/types.ts';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';

interface AdvisoryPanelProps {
  advisory: Advisory | null;
  provenance: Provenance | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  /** Shown in the empty state so the farmer knows what will be considered. */
  crop?: string | null;
}

function dayLabel(iso: string, index: number): string {
  if (!iso) return `Day ${index + 1}`;
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? `Day ${index + 1}`
    : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function AdvisoryPanel({
  advisory,
  provenance,
  loading,
  error,
  onGenerate,
  crop,
}: AdvisoryPanelProps) {
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-forest-600" aria-hidden="true" />
        <p className="mt-3 font-medium text-forest-800">Synthesising seven-day advisory</p>
        <p className="mt-1 text-sm text-ink-muted">
          Balancing rain forecast, temperature swings, and crop needs…
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-risk-critical/30 bg-rose-50/50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-risk-critical" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-semibold text-rose-900">Couldn't generate advisory</h3>
            <p className="mt-1 text-sm text-rose-800">{error}</p>
            <Button variant="secondary" onClick={onGenerate} className="mt-3">
              Try again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!advisory) {
    return (
      <Card className="p-6">
        <span className="grid size-10 place-items-center rounded-xl bg-forest-50 text-forest-600">
          <Sprout className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-semibold text-forest-800">Seven-day farm advisory</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Turn this forecast into decisions: when to irrigate, when to spray, what to watch for.
          {crop ? ` Tailored to your ${crop.toLowerCase()}.` : ' Add your crop for more specific advice.'}
        </p>
        <Button onClick={onGenerate} className="mt-5">
          <Sprout className="size-4" aria-hidden="true" />
          Generate advisory
        </Button>
      </Card>
    );
  }

  return (
    <Card elevated className="overflow-hidden">
      <div className="border-b border-hairline p-6">
        <h2 className="flex items-center gap-2 font-semibold text-forest-800">
          <Sprout className="size-4 text-forest-600" aria-hidden="true" />
          Seven-day farm advisory
        </h2>
        <p className="mt-2 text-ink">{advisory.summary}</p>
      </div>

      <ol className="divide-y divide-hairline">
        {advisory.days.map((day, index) => (
          <li key={`${day.date}-${index}`} className="flex gap-4 px-6 py-4">
            <span className="w-28 shrink-0 text-xs font-medium text-ink-subtle">
              {dayLabel(day.date, index)}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-forest-800">{day.headline}</p>
              {day.detail && <p className="mt-0.5 text-sm text-ink-muted">{day.detail}</p>}
            </div>
          </li>
        ))}
      </ol>

      {(advisory.irrigationGuidance || (advisory.regenerativePractices && advisory.regenerativePractices.length > 0)) && (
        <div className="grid gap-4 border-t border-hairline bg-surface-sunken p-6 sm:grid-cols-2">
          {advisory.irrigationGuidance && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-forest-700 uppercase">
                <Droplets className="size-3.5" aria-hidden="true" />
                Irrigation Guidance
              </p>
              <p className="mt-1 text-sm text-ink">{advisory.irrigationGuidance}</p>
            </div>
          )}
          {advisory.regenerativePractices && advisory.regenerativePractices.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-forest-700 uppercase">
                <Sprout className="size-3.5" aria-hidden="true" />
                Regenerative Practice
              </p>
              <p className="mt-1 text-sm text-ink">{advisory.regenerativePractices[0]}</p>
            </div>
          )}
        </div>
      )}

      {provenance && (
        <div className="border-t border-hairline px-6 py-3 text-xs text-ink-subtle">
          Generated with {provenance.model ?? provenance.provider}
          {provenance.latencyMs ? ` in ${provenance.latencyMs}ms` : ''} · deterministic agronomy rules applied
        </div>
      )}
    </Card>
  );
}
