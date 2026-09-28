import {
  Droplets,
  Wind,
  CloudRain,
  Thermometer,
  ShieldAlert,
  Sun,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherSnapshot } from '@shared/types.ts';
import type { WeatherRisk } from '../../hooks/useWeather.ts';
import { Card, DataLabel } from '../ui/Card.tsx';

/** WMO code to icon. Grouped rather than exhaustive — farmers need the gist. */
function iconForCode(code: number): LucideIcon {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return Snowflake;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 85 && code <= 86) return Snowflake;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

const RISK_STYLE: Record<WeatherRisk['fungal'], { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-forest-50 text-risk-low' },
  elevated: { label: 'Elevated', className: 'bg-clay-100 text-risk-elevated' },
  high: { label: 'High', className: 'bg-clay-100 text-risk-high' },
};

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-forest-500" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-ink-subtle">{label}</p>
        <p className="font-medium text-forest-800">{value}</p>
      </div>
    </div>
  );
}

function dayLabel(iso: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

interface WeatherPanelProps {
  weather: WeatherSnapshot;
  risk: WeatherRisk;
}

export function WeatherPanel({ weather, risk }: WeatherPanelProps) {
  const CurrentIcon = iconForCode(weather.now.conditionCode);
  const riskStyle = RISK_STYLE[risk.fungal];

  return (
    <div className="space-y-4">
      {/* Current conditions */}
      <Card elevated className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-ink-muted">{weather.location.label}</p>
            <div className="mt-1 flex items-center gap-3">
              <CurrentIcon className="size-9 text-forest-600" aria-hidden="true" />
              <p className="text-4xl font-semibold text-forest-800">
                {Math.round(weather.now.temperatureC)}°C
              </p>
            </div>
            <p className="mt-1 text-ink-muted">{weather.now.conditionLabel}</p>
          </div>
          <DataLabel source="sensor" />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-hairline p-6 sm:grid-cols-4">
          <Metric icon={Droplets} label="Humidity" value={`${Math.round(weather.now.humidityPct)}%`} />
          <Metric
            icon={CloudRain}
            label="Rain next 24h"
            value={`${risk.rainNext24hMm}mm · ${risk.rainProbabilityNext24hPct}%`}
          />
          <Metric icon={Wind} label="Wind" value={`${Math.round(weather.now.windKph)} km/h`} />
          <Metric
            icon={Thermometer}
            label="Today's range"
            value={
              weather.forecast[0]
                ? `${Math.round(weather.forecast[0].minC)}–${Math.round(weather.forecast[0].maxC)}°C`
                : '—'
            }
          />
        </div>
      </Card>

      {/* Deterministic risk — computed from the data, not inferred by a model. */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${riskStyle.className}`}>
            <ShieldAlert className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-forest-800">Fungal disease risk</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskStyle.className}`}
              >
                {riskStyle.label}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-ink-muted">{risk.fungalReason}</p>

            <div className="mt-4 rounded-xl bg-surface-sunken p-4">
              <h3 className="text-sm font-semibold text-forest-700">Irrigation</h3>
              <p className="mt-1 text-sm text-ink">{risk.irrigationHint}</p>
            </div>

            {risk.heatStress && (
              <p className="mt-3 text-sm text-risk-high">
                Heat stress conditions — water early, and shade young transplants if you can.
              </p>
            )}

            <p className="mt-3 text-xs text-ink-subtle">
              Calculated directly from humidity, temperature and rainfall rather than generated by
              AI, so these figures stay consistent.
            </p>
          </div>
        </div>
      </Card>

      {/* Seven-day strip */}
      <Card className="p-6">
        <h2 className="font-semibold text-forest-800">Next seven days</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {weather.forecast.map((day, index) => {
            const DayIcon = iconForCode(day.conditionCode);
            return (
              <li
                key={day.date}
                className="rounded-xl border border-hairline bg-surface-sunken p-3 text-center"
              >
                <p className="text-xs font-medium text-forest-700">{dayLabel(day.date, index)}</p>
                <DayIcon className="mx-auto mt-2 size-5 text-forest-500" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-forest-800">
                  {Math.round(day.maxC)}°
                  <span className="font-normal text-ink-subtle"> / {Math.round(day.minC)}°</span>
                </p>
                <p className="mt-1 text-[11px] text-ink-muted">
                  {day.precipitationProbabilityPct}% · {day.precipitationMm}mm
                </p>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
