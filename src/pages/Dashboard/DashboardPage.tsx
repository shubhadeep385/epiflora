import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Leaf,
  Mic,
  CloudSun,
  Sprout,
  ArrowRight,
  Activity,
  ChevronRight,
  Info,
  MapPin,
} from 'lucide-react';
import { Card, DataLabel } from '../../components/ui/Card.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useWeather } from '../../hooks/useWeather.ts';
import { computeFarmHealth, type FarmHealth } from '../../lib/farmHealth.ts';
import { DiagnosisHistoryModal } from '../../components/crop/DiagnosisHistoryModal.tsx';
import type { DiagnosisRecord } from '@shared/types.ts';

const QUICK_ACTIONS = [
  { to: '/diagnose', label: 'Diagnose crop', icon: Leaf },
  { to: '/ask', label: 'Ask EpiFlora', icon: Mic },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/soil', label: 'Soil', icon: Sprout },
] as const;

const BAND_STYLE: Record<FarmHealth['band'], { className: string; label: string }> = {
  good: { className: 'text-risk-low', label: 'Good' },
  fair: { className: 'text-risk-elevated', label: 'Fair' },
  attention: { className: 'text-risk-high', label: 'Needs attention' },
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Ring gauge for the health score. SVG so it needs no charting dependency. */
function ScoreRing({ score, band }: { score: number; band: FarmHealth['band'] }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative grid size-32 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute size-32 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-surface-sunken)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={BAND_STYLE[band].className}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-semibold text-forest-800">{score}</p>
        <p className="text-[11px] text-ink-subtle">out of 100</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const location = useAppStore((store) => store.location);
  const primaryCrop = useAppStore((store) => store.primaryCrop);
  const soil = useAppStore((store) => store.soil);
  const history = useAppStore((store) => store.history);
  const removeDiagnosis = useAppStore((store) => store.removeDiagnosis);

  const [selectedRecord, setSelectedRecord] = useState<DiagnosisRecord | null>(null);

  const { weather, risk } = useWeather(location);

  const health = computeFarmHealth({
    soil,
    risk,
    history,
    hasLocation: Boolean(location?.latitude),
  });

  const band = BAND_STYLE[health.band];

  return (
    <div className="max-w-4xl space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-forest-800 sm:text-3xl">
          {greeting()}
          {primaryCrop ? `, ${primaryCrop.toLowerCase()} grower` : ''} 👋
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="size-3.5" aria-hidden="true" />
          {location?.label ?? 'No location set yet'}
        </p>
      </div>

      {/* Farm health */}
      <Card elevated className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          <ScoreRing score={health.score} band={health.band} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-forest-800">Farm health</h2>
              <span className={`text-sm font-semibold ${band.className}`}>{band.label}</span>
            </div>

            {health.factors.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {health.factors.slice(0, 4).map((factor) => (
                  <li key={factor.label} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        factor.delta > 0 ? 'bg-risk-low' : 'bg-risk-elevated'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-ink-muted">{factor.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                Add your location, soil values or a crop check and this score will start reflecting
                your farm.
              </p>
            )}

            {health.completeness < 1 && (
              <p className="mt-3 flex items-start gap-2 text-xs text-ink-subtle">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Based on {Math.round(health.completeness * 100)}% of the information EpiFlora can use.
                A rough composite, calculated on this device — not a scientific index.
              </p>
            )}
          </div>
        </div>

        {health.nextAction && (
          <div className="mt-6 rounded-xl bg-forest-50 p-4">
            <p className="text-xs font-medium tracking-wide text-forest-600 uppercase">
              Next action
            </p>
            <p className="mt-1 text-forest-800">{health.nextAction}</p>
          </div>
        )}
      </Card>

      {/* Status tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
            <CloudSun className="size-3.5" aria-hidden="true" />
            Weather
          </p>
          {weather ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-forest-800">
                {Math.round(weather.now.temperatureC)}°C
              </p>
              <p className="text-sm text-ink-muted">
                {Math.round(weather.now.humidityPct)}% humidity
              </p>
              {risk && (
                <p className="mt-2 text-xs text-ink-subtle">
                  Rain next 24h: {risk.rainProbabilityNext24hPct}%
                </p>
              )}
            </>
          ) : (
            <Link to="/weather" className="mt-2 block text-sm text-forest-700 underline underline-offset-4">
              Set your location
            </Link>
          )}
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
            <Activity className="size-3.5" aria-hidden="true" />
            Disease risk
          </p>
          {risk ? (
            <>
              <p
                className={`mt-2 text-2xl font-semibold capitalize ${
                  risk.fungal === 'high'
                    ? 'text-risk-high'
                    : risk.fungal === 'elevated'
                      ? 'text-risk-elevated'
                      : 'text-risk-low'
                }`}
              >
                {risk.fungal}
              </p>
              <p className="text-sm text-ink-muted">from current conditions</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">Needs your location</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
              <Sprout className="size-3.5" aria-hidden="true" />
              Soil
            </p>
            {soil && <DataLabel source="user" />}
          </div>
          {soil ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-forest-800">
                {soil.ph ? `pH ${soil.ph.value}` : 'Recorded'}
              </p>
              <p className="text-sm text-ink-muted capitalize">{soil.soilType}</p>
            </>
          ) : (
            <Link to="/soil" className="mt-2 block text-sm text-forest-700 underline underline-offset-4">
              Add soil values
            </Link>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold text-forest-800">Quick actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
            <ButtonLink key={to} to={to} variant="secondary" className="justify-start">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </ButtonLink>
          ))}
        </div>
      </Card>

      {/* Farm history */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
          <h2 className="font-semibold text-forest-800">Recent crop checks</h2>
          {history.length > 0 && (
            <span className="text-xs text-ink-subtle">{history.length} saved on this device</span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="border-t border-hairline px-5 py-6 sm:px-6">
            <p className="text-sm text-ink-muted">
              No crop checks yet. Diagnose a crop and it will appear here, stored only on this
              device.
            </p>
            <ButtonLink to="/diagnose" className="mt-4">
              <Leaf className="size-4" aria-hidden="true" />
              Diagnose a crop
            </ButtonLink>
          </div>
        ) : (
          <ul className="divide-y divide-hairline border-t border-hairline">
            {history.slice(0, 6).map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(record)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-forest-50/60 dark:hover:bg-[#0E241B] sm:px-6 cursor-pointer"
                  aria-label={`View diagnosis details for ${record.diagnosis.diagnosis}`}
                >
                  {record.thumbnailDataUrl ? (
                    <img
                      src={record.thumbnailDataUrl}
                      alt=""
                      className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-forest-900/10 dark:ring-white/10"
                    />
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Leaf className="size-4" aria-hidden="true" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-forest-800 dark:text-[#FAF8F3] group-hover:text-forest-600 dark:group-hover:text-[#2AD58B] transition-colors">
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
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
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
        )}
      </Card>

      <Link
        to="/profile"
        className="flex min-h-11 items-center justify-between rounded-card border border-hairline bg-surface px-5 text-sm text-ink-muted transition-colors hover:bg-forest-50 hover:text-forest-700"
      >
        <span className="flex items-center gap-2">
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Farm details and language
        </span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>

      <p className="flex items-start gap-2 px-1 text-xs text-ink-subtle">
        <ArrowRight className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Everything on this screen is stored on your device only. Nothing is uploaded to a server.
      </p>

      {/* Interactive Diagnosis History Record Modal */}
      <DiagnosisHistoryModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onDelete={(id) => {
          removeDiagnosis(id);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
}
