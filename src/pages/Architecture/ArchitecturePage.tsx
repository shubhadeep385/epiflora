import {
  Network,
  Leaf,
  Mic,
  CloudSun,
  Sprout,
  Database,
  ShieldCheck,
  Languages,
  WifiOff,
  Recycle,
  type LucideIcon,
} from 'lucide-react';
import { Card, SectionHeading } from '../../components/ui/Card.tsx';
import { useHealth } from '../../hooks/useHealth.ts';

/**
 * How EpiFlora works, for a judge or a ministry evaluating reuse.
 *
 * Reads live provider status rather than describing an aspiration, so what is
 * shown is what is actually running.
 */

interface LayerProps {
  step: string;
  title: string;
  body: string;
  items?: Array<{ icon: LucideIcon; label: string; detail: string }>;
}

function Layer({ step, title, body, items }: LayerProps) {
  return (
    <div className="relative pl-10">
      {/* Connector line, drawn so the flow reads top to bottom. */}
      <span
        className="absolute top-9 bottom-0 left-[15px] w-px bg-hairline"
        aria-hidden="true"
      />
      <span className="absolute top-0 left-0 grid size-8 place-items-center rounded-full bg-forest-700 text-xs font-semibold text-white">
        {step}
      </span>

      <h3 className="font-semibold text-forest-800">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted">{body}</p>

      {items && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map(({ icon: Icon, label, detail }) => (
            <li key={label} className="rounded-xl border border-hairline bg-surface p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-forest-800">
                <Icon className="size-4 text-forest-600" aria-hidden="true" />
                {label}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PRINCIPLES = [
  {
    icon: Recycle,
    title: 'Provider-agnostic',
    body: 'Every model sits behind one interface. Swapping Gemini for a local Ollama model, or Sarvam for another speech provider, is configuration rather than a rewrite.',
  },
  {
    icon: WifiOff,
    title: 'Degrades, never dies',
    body: 'An ordered fallback chain ends at a seeded Demo Mode that needs no keys, so an exhausted quota or a dead connection still leaves a working product.',
  },
  {
    icon: Languages,
    title: 'Language as a layer',
    body: 'Speech and translation sit beside the reasoning layer, not inside it. That is what lets the same intelligence reach a farmer who does not read English.',
  },
  {
    icon: ShieldCheck,
    title: 'Honest by construction',
    body: 'Model output is schema-validated, dosages are stripped mechanically, risk figures are computed deterministically, and every value carries its source.',
  },
  {
    icon: Database,
    title: 'One schema, many countries',
    body: 'A farm in Pune and a demo region in Mato Grosso are the same record shape, so a national dataset can plug in without changing the platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    body: 'No account required. Farm data stays in the browser, and crop photos are analysed then discarded rather than stored.',
  },
] as const;

export function ArchitecturePage() {
  const { health } = useHealth();

  const configured = (health?.intelligence ?? []).filter((provider) => provider.configured);
  const speech = (health?.speech ?? []).filter((provider) => provider.configured);

  return (
    <div className="max-w-3xl space-y-4">
      <SectionHeading
        as="h1"
        icon={Network}
        title="How EpiFlora works"
        description="Designed as a reusable digital public good, not a single-country app."
      />

      <Card className="p-6 sm:p-8">
        <div className="space-y-10">
          <Layer
            step="1"
            title="The farmer"
            body="A smallholder with a phone, in a field, possibly on a weak connection and not necessarily reading English. Every decision below follows from that."
          />

          <Layer
            step="2"
            title="Multimodal input"
            body="Four ways in, none of them mandatory. Anything reachable by voice or photo is also reachable by typing."
            items={[
              { icon: Leaf, label: 'Crop photo', detail: 'Downscaled on the device before upload' },
              { icon: Mic, label: 'Voice, 11 languages', detail: 'Code-mixed speech supported' },
              { icon: CloudSun, label: 'Location', detail: 'Optional; manual entry always offered' },
              { icon: Sprout, label: 'Soil values', detail: 'Only what the farmer enters' },
            ]}
          />

          <Layer
            step="3"
            title="Language layer"
            body={
              speech.length > 0
                ? `Speech recognition and voice output, currently via ${speech.map((p) => p.label).join(', then ')}. Falls back to the device's own voice.`
                : 'Speech recognition and voice output, with the device\u2019s own voice as fallback.'
            }
          />

          <Layer
            step="4"
            title="Intelligence layer"
            body={
              configured.length > 0
                ? `Ordered fallback chain, live right now: ${configured.map((p) => p.label).join(' → ')}.`
                : 'Ordered fallback chain ending in seeded Demo Mode.'
            }
          />

          <Layer
            step="5"
            title="Deterministic agronomy"
            body="Disease risk from humidity and rainfall, pH banding, and the limiting-nutrient calculation are computed in code. Settled agronomy does not need inference, and a figure a model cannot invent is one that can be defended."
          />

          <Layer
            step="6"
            title="Shared data layer"
            body="Country → Region → Farm → Farmer, with crop cycles, soil readings, weather observations, diagnoses and advisories hanging off the farm. Every record carries its source and unit. localStorage today, behind an interface a database can replace."
          />

          <Layer
            step="7"
            title="National and regional systems"
            body="Because the farmer's farm and every demo region share one schema, a country can connect its own datasets and reuse the same rails rather than rebuilding them."
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-5">
            <p className="flex items-center gap-2 font-medium text-forest-800">
              <Icon className="size-4 text-forest-600" aria-hidden="true" />
              {title}
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">{body}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-forest-800 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">The short version</h2>
        <p className="mt-3 text-forest-100">
          Gemini supplies the agricultural intelligence. Sarvam makes that intelligence reachable in
          the farmer's own language. One normalised schema makes it shareable across BRICS nations.
          Any of those three parts can be replaced without touching the other two.
        </p>
      </Card>
    </div>
  );
}
