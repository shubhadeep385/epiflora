import { Check, Loader2 } from 'lucide-react';
import { DIAGNOSIS_STAGES } from '../../hooks/useDiagnosis.ts';
import { Card } from '../ui/Card.tsx';

interface AnalysisProgressProps {
  /** Index of the stage currently running. */
  stage: number;
}

/**
 * Staged progress instead of a bare spinner (Phase 1 §35).
 *
 * The stages are presentational — the API exposes no progress events — so this
 * never marks the final stage complete. It communicates "work is happening" and
 * roughly what kind, without claiming a step finished when it may not have.
 */
export function AnalysisProgress({ stage }: AnalysisProgressProps) {
  return (
    <Card className="p-6" aria-live="polite" aria-busy="true">
      <h2 className="font-semibold text-forest-800">Analysing your crop…</h2>

      <ol className="mt-4 space-y-3">
        {DIAGNOSIS_STAGES.map((label, index) => {
          const done = index < stage;
          const active = index === stage;

          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={[
                  'grid size-5 shrink-0 place-items-center rounded-full',
                  done
                    ? 'bg-forest-600 text-white'
                    : active
                      ? 'bg-forest-50 text-forest-600'
                      : 'bg-surface-sunken text-ink-subtle',
                ].join(' ')}
              >
                {done ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                )}
              </span>
              <span className={done || active ? 'text-ink' : 'text-ink-subtle'}>{label}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-xs text-ink-subtle">
        Photos are analysed and discarded. They are not stored on our servers.
      </p>
    </Card>
  );
}
