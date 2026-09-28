import { Compass } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';

export function NotFoundPage() {
  return (
    <div className="max-w-xl">
      <Card className="p-8">
        <span className="grid size-10 place-items-center rounded-xl bg-forest-50 text-forest-600">
          <Compass className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-forest-800">This page does not exist</h1>
        <p className="mt-2 text-ink-muted">
          The link may be out of date. Everything EpiFlora can do is reachable from the dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/dashboard">Go to farm dashboard</ButtonLink>
          <ButtonLink to="/diagnose" variant="secondary">
            Diagnose a crop
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
