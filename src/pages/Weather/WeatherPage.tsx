import { CloudSun, Loader2 } from 'lucide-react';
import { SectionHeading, Card } from '../../components/ui/Card.tsx';
import { LocationPicker } from '../../components/weather/LocationPicker.tsx';
import { WeatherPanel } from '../../components/weather/WeatherPanel.tsx';
import { AdvisoryPanel } from '../../components/weather/AdvisoryPanel.tsx';
import { useWeather, useAdvisory } from '../../hooks/useWeather.ts';
import { useAppStore } from '../../store/appStore.ts';

export function WeatherPage() {
  const location = useAppStore((store) => store.location);
  const primaryCrop = useAppStore((store) => store.primaryCrop);

  const { weather, risk, loading, error } = useWeather(location);
  const advisory = useAdvisory(location);

  return (
    <div className="max-w-4xl space-y-4">
      <SectionHeading
        as="h1"
        icon={CloudSun}
        title="Weather advisory"
        description="Seven days of forecast turned into decisions about irrigation, spraying and disease risk."
      />

      <LocationPicker />

      {!location && (
        <Card className="p-6">
          <p className="text-sm text-ink-muted">
            Set a location above to see the forecast. Nothing is shared with anyone else — your
            location is stored only on this device.
          </p>
        </Card>
      )}

      {location && loading && (
        <Card className="p-6" aria-busy="true">
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading forecast for {location.label}…
          </p>
        </Card>
      )}

      {location && error && (
        <Card className="p-6">
          <p role="alert" className="text-sm text-clay-700">
            {error}
          </p>
        </Card>
      )}

      {weather && risk && (
        <>
          <WeatherPanel weather={weather} risk={risk} />
          <AdvisoryPanel
            advisory={advisory.advisory}
            provenance={advisory.provenance}
            loading={advisory.loading}
            error={advisory.error}
            onGenerate={() => void advisory.generate()}
            crop={primaryCrop}
          />
        </>
      )}
    </div>
  );
}
