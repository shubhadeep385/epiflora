import { useState } from 'react';
import { Activity, Leaf, Droplets, Layers, ShieldAlert, type LucideIcon } from 'lucide-react';
import { assetUrl } from '../../lib/assets.ts';

interface SignalItem {
  id: string;
  title: string;
  code: string;
  status: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  metric: string;
  submetric: string;
  icon: LucideIcon;
}

const SIGNALS: SignalItem[] = [
  {
    id: 'ndvi',
    title: 'Multispectral Canopy Vigour',
    code: 'NDVI • 0.84',
    status: 'Vibrant Growth',
    badgeBg: 'bg-[#E9FFEC] dark:bg-emerald-950/60',
    badgeText: 'text-[#0F3D2E] dark:text-emerald-300',
    description: 'Near-infrared reflectance index detecting chlorophyll density and early stress 96 hours before human eye visibility.',
    metric: '94.2%',
    submetric: '+3.1% vs regional benchmark',
    icon: Leaf,
  },
  {
    id: 'soil',
    title: 'Subterranean Nutrient Matrix',
    code: 'pH 6.4 • NPK BALANCED',
    status: 'Optimal Biome',
    badgeBg: 'bg-[#FEF3C7] dark:bg-amber-950/60',
    badgeText: 'text-[#92400E] dark:text-amber-300',
    description: 'Active nitrogen bioavailability and organic carbon saturation mapped directly against root development depth.',
    metric: '48 mg/kg',
    submetric: 'Nitrogen reserve sufficient for flowering',
    icon: Layers,
  },
  {
    id: 'weather',
    title: 'Microclimate Evapotranspiration',
    code: 'ET₀ • 4.2 mm/day',
    status: 'Irrigation Window Open',
    badgeBg: 'bg-[#E0F2FE] dark:bg-sky-950/60',
    badgeText: 'text-[#075985] dark:text-sky-300',
    description: 'Combines solar radiation, ambient vapor deficit, and wind vector to calculate precise water retention schedules.',
    metric: '72% Hum',
    submetric: 'Next scheduled drip: 05:30 AM tomorrow',
    icon: Droplets,
  },
  {
    id: 'risk',
    title: 'Pathogen Spore Micro-Index',
    code: 'BLIGHT VECTOR • LOW',
    status: '12% Risk Index',
    badgeBg: 'bg-[#FEE2E2] dark:bg-rose-950/60',
    badgeText: 'text-[#991B1B] dark:text-rose-300',
    description: 'Predictive fungal infection modeling calculating continuous leaf wetness hours and spore dispersion velocity.',
    metric: 'Low Threat',
    submetric: 'Zero fungicide required at current humidity',
    icon: ShieldAlert,
  },
];

export function FarmSignalsSection() {
  const [activeSignal, setActiveSignal] = useState(0);
  const currentSig: SignalItem = SIGNALS[activeSignal] || SIGNALS[0]!;

  return (
    <section
      id="signals"
      className="relative z-10 bg-[#FCF9F0] dark:bg-[#091811] py-24 sm:py-32 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300"
      aria-labelledby="signals-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
              <Activity className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#a3e635]" />
              <span>CONTINUOUS MULTI-SIGNAL TELEMETRY</span>
            </div>

            <h2
              id="signals-heading"
              className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-5xl"
            >
              Every field holds <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">a signal.</span>
            </h2>

            <p className="mt-4 font-sans text-base text-[#4F6355] dark:text-emerald-100/70 sm:text-lg">
              A single sensor or photograph only tells part of the story. EpiFLora fuses satellite
              multispectral bands, soil chemistry, and microclimate telemetry into one unified decision model.
            </p>
          </div>

          <div className="mt-6 md:mt-0 font-mono text-xs text-[#0F3D2E]/60 dark:text-white/50">
            <span>LIVE FEDERATION FLORA: PUNE 4A</span>
          </div>
        </div>

        {/* 12-Column Editorial Bento Grid */}
        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Interactive Telemetry Card Stack (5 Cols) */}
          <div className="flex flex-col justify-between space-y-3.5 lg:col-span-5">
            {SIGNALS.map((sig, idx) => {
              const Icon = sig.icon;
              const isSelected = activeSignal === idx;
              return (
                <div
                  key={sig.id}
                  onClick={() => setActiveSignal(idx)}
                  className={`group relative cursor-pointer rounded-2xl p-5 transition-all duration-200 ${
                    isSelected
                      ? 'bg-white dark:bg-[#0E241B] border-2 border-[#0F3D2E] dark:border-[#2AD58B] shadow-md -translate-x-1'
                      : 'bg-white/70 dark:bg-[#0E221A]/70 border border-[#0F3D2E]/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#0E241B]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-[#0F3D2E] dark:bg-[#2AD58B] text-white dark:text-[#07130E]'
                            : 'bg-[#FAF8F3] dark:bg-[#132C22] text-[#0F3D2E] dark:text-[#FAF8F3]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
                          {sig.title}
                        </h3>
                        <p className="font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60">{sig.code}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${sig.badgeBg} ${sig.badgeText}`}
                    >
                      {sig.status}
                    </span>
                  </div>

                  <p className="mt-2.5 font-sans text-xs sm:text-sm text-[#374B3E] dark:text-slate-200 leading-relaxed">
                    {sig.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-[#0F3D2E]/8 dark:border-white/10 pt-2.5 font-mono text-xs">
                    <span className="font-bold text-[#0F3D2E] dark:text-[#a3e635]">{sig.metric}</span>
                    <span className="text-[11px] text-[#4F6355] dark:text-emerald-100/60">{sig.submetric}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: High-Resolution Agricultural Aerial Bento Visualizer (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 shadow-sm h-full">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4 font-mono text-xs text-[#0F3D2E] dark:text-[#FAF8F3]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E] dark:bg-[#a3e635] animate-pulse" />
                  <span className="font-semibold">SPECTRAL SYNTHESIS: PUNE SECTOR 4A</span>
                </div>
                <span className="rounded-full bg-[#FAF8F3] dark:bg-[#132C22] px-2.5 py-0.5 text-[11px] text-[#4F6355] dark:text-emerald-100/60">
                  SENTINEL-2 • 10M RES
                </span>
              </div>

              {/* Spectral Field Visualization Image with Editorial Framing */}
              <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#091811]">
                <img
                  src={assetUrl('/images/farmland_hero.jpg')}
                  alt="Multispectral Agricultural Field"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Editorial Data Overlay Badges */}
                <div className="absolute top-4 left-4 rounded-full border border-white/40 bg-white/90 dark:bg-black/80 dark:border-white/20 px-3.5 py-1 font-mono text-xs font-semibold text-[#0F3D2E] dark:text-[#FAF8F3] shadow-sm backdrop-blur-md">
                  LAYER: {currentSig.code}
                </div>

                <div className="absolute bottom-4 right-4 rounded-full border border-white/40 bg-white/90 dark:bg-black/80 dark:border-white/20 px-3.5 py-1 font-mono text-xs font-semibold text-[#0F3D2E] dark:text-[#FAF8F3] shadow-sm backdrop-blur-md">
                  CONFIDENCE: 98.6%
                </div>
              </div>

              {/* Spectral Absorbance Curve (Chlorophyll α/β Ratio) */}
              <div className="mt-4 rounded-2xl border border-[#0F3D2E]/8 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#132C22] p-4">
                <div className="flex items-center justify-between font-mono text-xs text-[#4F6355] dark:text-emerald-100/70">
                  <span className="font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">CHLOROPHYLL ABSORBANCE CURVE</span>
                  <span className="text-[#22C55E] dark:text-[#a3e635] font-bold">OPTIMAL PHOTOSYNTHESIS</span>
                </div>
                <div className="mt-3 flex h-16 items-end gap-1.5">
                  {[42, 58, 72, 88, 82, 68, 92, 85, 90, 76, 62, 80, 94, 75, 87, 96, 82, 70].map(
                    (val, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-[#0F3D2E] to-[#2AD58B] dark:from-[#2AD58B] dark:to-[#a3e635] transition-all duration-300 hover:opacity-80"
                        style={{ height: `${val}%` }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
