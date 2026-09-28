import {
  AlertTriangle,
  Camera,
  FlaskConical,
  Info,
  Leaf,
  RefreshCw,
  Shield,
  Sprout,
  Clock,
  Eye,
  Mic,
  type LucideIcon,
} from 'lucide-react';
import type { CropDiagnosis, Provenance, Severity } from '@shared/types.ts';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';

interface DiagnosisResultProps {
  diagnosis: CropDiagnosis;
  provenance: Provenance;
  onStartOver: () => void;
  /** Hands the photo to the Voice Copilot for a spoken follow-up. */
  onAskAboutPhoto?: () => void;
}

const SEVERITY_STYLE: Record<Severity, { label: string; className: string }> = {
  low: { label: 'Low severity', className: 'bg-forest-50 text-risk-low' },
  moderate: { label: 'Moderate severity', className: 'bg-clay-100 text-risk-elevated' },
  high: { label: 'High severity', className: 'bg-clay-100 text-risk-high' },
  critical: { label: 'Critical severity', className: 'bg-clay-100 text-risk-critical' },
};

function ListSection({
  icon: Icon,
  title,
  items,
  tone = 'default',
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  tone?: 'default' | 'muted';
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-forest-700 uppercase">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </h3>
      <ul className={`mt-3 space-y-2 ${tone === 'muted' ? 'text-ink-muted' : 'text-ink'}`}>
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm">
            <span
              className="mt-[7px] size-1.5 shrink-0 rounded-full bg-forest-300"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Unusable photo gets its own screen rather than a low-confidence guess. */
function UnusableImage({ diagnosis, onStartOver }: Omit<DiagnosisResultProps, 'provenance'>) {
  return (
    <Card elevated className="p-6 sm:p-8">
      <span className="grid size-11 place-items-center rounded-xl bg-clay-100 text-clay-700">
        <Camera className="size-5" aria-hidden="true" />
      </span>

      <h2 className="mt-5 text-xl font-semibold text-forest-800">
        We couldn’t assess this photo
      </h2>
      <p className="mt-2 text-ink-muted">
        Rather than guess at a diagnosis, here is what would make the next photo readable.
      </p>

      <ul className="mt-5 space-y-2">
        {(diagnosis.recommendations.length > 0
          ? diagnosis.recommendations
          : [
              'Fill the frame with a single affected leaf',
              'Take the photo in natural daylight, avoiding harsh shadow',
              'Hold the camera steady and let it focus before capturing',
              'Include a healthy leaf alongside the affected one',
            ]
        ).map((tip) => (
          <li key={tip} className="flex gap-2.5 text-sm">
            <span
              className="mt-[7px] size-1.5 shrink-0 rounded-full bg-clay-300"
              aria-hidden="true"
            />
            {tip}
          </li>
        ))}
      </ul>

      <Button onClick={onStartOver} className="mt-7">
        <RefreshCw className="size-4" aria-hidden="true" />
        Try another photo
      </Button>
    </Card>
  );
}

export function DiagnosisResult({
  diagnosis,
  provenance,
  onStartOver,
  onAskAboutPhoto,
}: DiagnosisResultProps) {
  if (diagnosis.imageQuality === 'unusable') {
    return <UnusableImage diagnosis={diagnosis} onStartOver={onStartOver} />;
  }

  const severity = SEVERITY_STYLE[diagnosis.severity];

  return (
    <div className="space-y-4">
      {diagnosis.imageQuality === 'unclear' && (
        <div className="flex gap-3 rounded-card border border-clay-300 bg-clay-100 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-clay-700" aria-hidden="true" />
          <p className="text-sm text-clay-700">
            The photo was hard to read, so treat this assessment as a starting point. A clearer
            close-up in daylight would give a more reliable answer.
          </p>
        </div>
      )}

      <Card elevated className="overflow-hidden">
        {/* Headline verdict */}
        <div className="border-b border-hairline p-6 sm:p-8">
          <p className="text-sm font-medium tracking-wide text-forest-600 uppercase">Likely issue</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-forest-800 sm:text-3xl">
            {diagnosis.diagnosis}
          </h2>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severity.className}`}
            >
              {severity.label}
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
              <span className="font-semibold text-forest-700">{diagnosis.confidence}%</span>
              AI confidence
              <span
                className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-sunken"
                role="img"
                aria-label={`Confidence ${diagnosis.confidence} percent`}
              >
                <span
                  className="block h-full rounded-full bg-forest-500"
                  style={{ width: `${diagnosis.confidence}%` }}
                />
              </span>
            </span>
          </div>

          <p className="mt-5 flex items-start gap-2 text-sm text-ink">
            <Clock className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden="true" />
            <span>
              <span className="font-medium">When to act: </span>
              {diagnosis.urgency}
            </span>
          </p>
        </div>

        {/* Detail */}
        <div className="grid gap-7 p-6 sm:p-8 md:grid-cols-2">
          <ListSection icon={Eye} title="What we can see" items={diagnosis.symptoms} />
          <ListSection icon={Info} title="Likely cause" items={diagnosis.causes} />
          <ListSection icon={Leaf} title="Recommended action" items={diagnosis.recommendations} />
          <ListSection icon={Sprout} title="Organic remedies" items={diagnosis.organicRemedies} />
          <ListSection icon={Shield} title="Prevention" items={diagnosis.prevention} />
          <ListSection
            icon={Sprout}
            title="Regenerative practices"
            items={diagnosis.regenerativePractices}
          />
        </div>

        {/* Chemicals sit behind a disclosure: organic first is a product stance,
            and dosages are deliberately absent. */}
        {diagnosis.chemicalOptions.length > 0 && (
          <details className="border-t border-hairline px-6 py-5 sm:px-8">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-muted">
              <FlaskConical className="size-4" aria-hidden="true" />
              Chemical options, if organic measures are not enough
            </summary>
            <ul className="mt-3 space-y-2">
              {diagnosis.chemicalOptions.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-ink-muted">
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-clay-300"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-subtle">
              No quantities are given by design. Always follow the product label and your local
              agricultural extension service.
            </p>
          </details>
        )}

        {diagnosis.weatherRiskNote && (
          <div className="border-t border-hairline bg-surface-sunken px-6 py-5 sm:px-8">
            <h3 className="text-sm font-semibold text-forest-700">Weather and soil context</h3>
            <p className="mt-1.5 text-sm text-ink-muted">{diagnosis.weatherRiskNote}</p>
          </div>
        )}

        {/* Provenance and disclaimer */}
        <div className="border-t border-hairline px-6 py-5 sm:px-8">
          <p className="text-xs text-ink-subtle">{diagnosis.disclaimer}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-subtle">
            <span>
              Assessed by <span className="font-medium">{provenance.model}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{(provenance.latencyMs / 1000).toFixed(1)}s</span>
            {provenance.cached && (
              <>
                <span aria-hidden="true">·</span>
                <span>previously analysed result</span>
              </>
            )}
            {provenance.degraded && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-clay-700">backup provider</span>
              </>
            )}
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Hands this photo to the Voice Copilot so a farmer can follow up in
            their own language without uploading it again. */}
        {onAskAboutPhoto && (
          <Button onClick={onAskAboutPhoto}>
            <Mic className="size-4" aria-hidden="true" />
            Ask about this photo
          </Button>
        )}
        <Button onClick={onStartOver} variant="secondary">
          <RefreshCw className="size-4" aria-hidden="true" />
          Check another crop
        </Button>
      </div>
    </div>
  );
}
