import { useState } from 'react';
import { MapPin, Crosshair, Search, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { useLocation } from '../../hooks/useLocation.ts';

/**
 * Location entry. Both routes are offered side by side, never gated on each other:
 * geolocation for convenience, typing for everyone whose device or browser will
 * not cooperate.
 */
export function LocationPicker() {
  const { location, useCurrentPosition, search, status, error } = useLocation();
  const [query, setQuery] = useState('');

  const busy = status === 'locating' || status === 'searching';

  return (
    <Card className="p-5 sm:p-6">
      {location ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-600">
            <MapPin className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-forest-800">{location.label}</p>
            {location.latitude !== undefined && (
              <p className="text-xs text-ink-subtle">
                {location.latitude.toFixed(3)}, {location.longitude?.toFixed(3)}
                {location.countryCode ? ` · ${location.countryCode}` : ''}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-clay-100 text-clay-700">
            <MapPin className="size-[18px]" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-forest-800">Where is your farm?</p>
            <p className="mt-1 text-sm text-ink-muted">
              Weather and advice are local. Share your location or type the nearest town.
            </p>
          </div>
        </div>
      )}

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void search(query);
        }}
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={location ? 'Change location' : 'Town, district or city'}
            aria-label="Search for a location"
            className="min-h-11 w-full rounded-xl border border-hairline bg-surface pr-3 pl-9 text-base text-ink focus:border-forest-400"
          />
        </div>

        <Button type="submit" variant="secondary" disabled={busy || query.trim().length < 2}>
          {status === 'searching' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          Search
        </Button>

        <Button type="button" onClick={useCurrentPosition} disabled={busy} variant="ghost">
          {status === 'locating' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Crosshair className="size-4" aria-hidden="true" />
          )}
          Use my location
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-clay-700">
          {error}
        </p>
      )}
    </Card>
  );
}
