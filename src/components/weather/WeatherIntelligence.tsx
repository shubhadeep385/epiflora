import { useState } from 'react';
import { CloudRain, Sun, Wind, Droplets, ArrowRight, Layers, BarChart3, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore.ts';

interface SoilLayer {
  depth: string;
  name: string;
  moisture: number;
  temp: number;
  texture: string;
  ec: number;
  status: 'Optimal' | 'Adequate' | 'Saturated' | 'Dry';
  description: string;
}

const SOIL_LAYERS: SoilLayer[] = [
  {
    depth: '0 - 10 cm',
    name: 'Topsoil & Seedbed Horizon (A₀)',
    moisture: 42,
    temp: 28.4,
    texture: 'Clay Loam (Rich Humus)',
    ec: 1.2,
    status: 'Optimal',
    description: 'Active seed germination zone, rapid solar evaporation rate, high microbial activity.',
  },
  {
    depth: '10 - 30 cm',
    name: 'Feeder Root Zone (A₁)',
    moisture: 58,
    temp: 24.8,
    texture: 'Medium Loam (Balanced Pores)',
    ec: 1.4,
    status: 'Optimal',
    description: 'Primary mycorrhizal and root nutrient absorption layer; holds stable capillary water.',
  },
  {
    depth: '30 - 60 cm',
    name: 'Subterranean Deep Reserve (B Horizon)',
    moisture: 71,
    temp: 22.1,
    texture: 'Dense Clay Subsoil',
    ec: 1.8,
    status: 'Saturated',
    description: 'Deep moisture bank insulating against surface drought and heatwaves.',
  },
];

const ETO_DATA = [
  { day: 'Mon', date: 'Aug 21', etoMm: 4.2, heightPct: 65, optimal: true },
  { day: 'Tue', date: 'Aug 22', etoMm: 4.8, heightPct: 75, optimal: false },
  { day: 'Wed', date: 'Aug 23', etoMm: 5.1, heightPct: 82, optimal: false },
  { day: 'Thu', date: 'Aug 24', etoMm: 3.9, heightPct: 58, optimal: true },
  { day: 'Fri', date: 'Aug 25', etoMm: 3.4, heightPct: 50, optimal: true },
  { day: 'Sat', date: 'Aug 26', etoMm: 4.5, heightPct: 70, optimal: false },
  { day: 'Sun', date: 'Aug 27', etoMm: 4.1, heightPct: 62, optimal: true },
];

export function WeatherIntelligence() {
  const [activeLayerIdx, setActiveLayerIdx] = useState(1);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const location = useAppStore((state) => state.location);

  const activeLayer = SOIL_LAYERS[activeLayerIdx] ?? SOIL_LAYERS[0]!;
  const stationLabel = location?.label ? `${location.label.split(',')[0]} Agronomy Station` : 'Pune Agronomy Station';
  const coordsLabel = location?.latitude !== undefined
    ? `${location.latitude.toFixed(4)}° N, ${location.longitude?.toFixed(4)}° E`
    : '18.5204° N, 73.8567° E • Elev 560m';

  return (
    <section
      id="weather-soil"
      className="relative z-10 bg-[#FAF8F3] dark:bg-[#07130e] py-24 sm:py-32 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300"
      aria-labelledby="weather-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
              <Sun className="h-3.5 w-3.5 text-[#C2703F] dark:text-[#f97316]" />
              <span>HYPERLOCAL WEATHER & SUBTERRANEAN BIOME</span>
            </div>

            <h2
              id="weather-heading"
              className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-5xl"
            >
              The farm as <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">a living system.</span>
            </h2>

            <p className="mt-4 font-sans text-base text-[#4F6355] dark:text-emerald-100/70 sm:text-lg">
              Weather does not stop at the surface. EpiFlora connects open meteorological models with
              deep root zone moisture sensors to predict exact irrigation hours and evaporative stress.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <Link
              to="/weather"
              className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] px-6 py-3 text-xs font-semibold text-white dark:text-[#07130E] shadow-md transition-all hover:bg-[#175440] dark:hover:bg-[#34e095]"
            >
              <span>View Full Weather & Soil</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento Grid: Weather Telemetry (Left) + Subterranean Soil Depth (Right) */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Weather Microclimate & Evapotranspiration Bento Stack (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            {/* Primary Microclimate Telemetry Card */}
            <div className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                    {stationLabel}
                  </h3>
                  <p className="font-mono text-xs text-[#4F6355] dark:text-emerald-100/60 mt-0.5">
                    {coordsLabel}
                  </p>
                </div>
                <span className="rounded-full bg-[#E9FFEC] dark:bg-emerald-950/70 border border-emerald-500/20 px-3 py-1 font-mono text-xs font-semibold text-[#0F3D2E] dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span>LIVE SENSOR</span>
                </span>
              </div>

              {/* Main Temp & Condition */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-5xl font-extrabold text-[#0F3D2E] dark:text-[#FAF8F3]">28°C</span>
                    <span className="font-sans text-sm font-semibold text-[#4F6355] dark:text-emerald-100/70">Partly Cloudy</span>
                  </div>
                  <p className="mt-1 font-sans text-xs text-[#4F6355] dark:text-emerald-100/60">
                    Feels like 30°C • Dew point 21.4°C
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 shadow-inner">
                  <Sun className="h-8 w-8" />
                </div>
              </div>

              {/* Weather Metrics Grid */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#0F3D2E]/8 dark:border-white/10 pt-5 text-center">
                <div className="rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-3 border border-[#0F3D2E]/6 dark:border-white/5">
                  <div className="flex items-center justify-center gap-1 text-[#0284C7] dark:text-sky-400">
                    <Droplets className="h-4 w-4" />
                    <span className="font-mono text-xs font-bold">68%</span>
                  </div>
                  <p className="mt-1 font-sans text-[11px] text-[#4F6355] dark:text-emerald-100/60">Humidity</p>
                </div>

                <div className="rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-3 border border-[#0F3D2E]/6 dark:border-white/5">
                  <div className="flex items-center justify-center gap-1 text-[#22C55E] dark:text-emerald-400">
                    <CloudRain className="h-4 w-4" />
                    <span className="font-mono text-xs font-bold">64%</span>
                  </div>
                  <p className="mt-1 font-sans text-[11px] text-[#4F6355] dark:text-emerald-100/60">Rain Chance</p>
                </div>

                <div className="rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-3 border border-[#0F3D2E]/6 dark:border-white/5">
                  <div className="flex items-center justify-center gap-1 text-[#8C6A4D] dark:text-amber-300">
                    <Wind className="h-4 w-4" />
                    <span className="font-mono text-xs font-bold">14 km/h</span>
                  </div>
                  <p className="mt-1 font-sans text-[11px] text-[#4F6355] dark:text-emerald-100/60">Wind (SW)</p>
                </div>
              </div>
            </div>

            {/* 7-Day Evapotranspiration (ET₀) Forecast Bar Chart Card (Spacious & Generous Height) */}
            <div className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 sm:p-7 shadow-sm flex flex-col justify-between flex-grow">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0F3D2E]/10 dark:border-white/10 pb-3.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
                  <span className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] uppercase tracking-wider">
                    7-DAY EVAPOTRANSPIRATION (ET₀)
                  </span>
                </div>
                <span className="rounded-full bg-[#FCF9F0] dark:bg-white/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#8C6A4D] dark:text-[#d9f99d]">
                  OPTIMAL IRRIGATION WINDOW: 05:00 - 07:30
                </span>
              </div>

              {/* Bar Chart Canvas with Real Height & Scales */}
              <div className="mt-6 flex flex-col justify-end">
                {/* Horizontal Baseline Guides */}
                <div className="relative h-40 sm:h-44 w-full flex items-end justify-between gap-3 sm:gap-4 pb-2 border-b border-[#0F3D2E]/15 dark:border-white/15">
                  {/* Subtle Grid Guidelines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-dashed border-[#0F3D2E] dark:border-white w-full" />
                    <div className="border-b border-dashed border-[#0F3D2E] dark:border-white w-full" />
                    <div className="border-b border-dashed border-[#0F3D2E] dark:border-white w-full" />
                  </div>

                  {ETO_DATA.map((item, idx) => {
                    const isHovered = hoveredDay === idx;
                    return (
                      <div
                        key={item.day}
                        onMouseEnter={() => setHoveredDay(idx)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className="relative flex flex-1 flex-col items-center justify-end h-full group cursor-pointer z-10"
                      >
                        {/* ET mm readout on top of bar */}
                        <span className={`font-mono text-[11px] font-bold mb-1 transition-transform ${
                          isHovered ? 'text-[#22C55E] dark:text-[#2AD58B] scale-110 -translate-y-1' : 'text-[#4F6355] dark:text-emerald-100/70'
                        }`}>
                          {item.etoMm}mm
                        </span>

                        {/* Animated Bar with Gradient */}
                        <div
                          className={`w-full max-w-[38px] rounded-t-xl transition-all duration-300 shadow-sm ${
                            item.optimal
                              ? 'bg-gradient-to-t from-[#0F3D2E] to-[#22C55E] dark:from-[#134e38] dark:to-[#2AD58B]'
                              : 'bg-gradient-to-t from-[#8C6A4D] to-[#d97706] dark:from-[#78350f] dark:to-[#f59e0b]'
                          } ${isHovered ? 'brightness-125 scale-x-105 shadow-md' : 'opacity-90 hover:opacity-100'}`}
                          style={{ height: `${item.heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Day Labels Strip */}
                <div className="flex items-center justify-between gap-3 sm:gap-4 pt-3">
                  {ETO_DATA.map((item, idx) => (
                    <div key={item.day} className="flex-1 text-center">
                      <p className={`font-mono text-xs font-bold transition-colors ${
                        hoveredDay === idx ? 'text-[#0F3D2E] dark:text-[#2AD58B]' : 'text-[#4F6355] dark:text-emerald-100/70'
                      }`}>
                        {item.day}
                      </p>
                      <p className="font-sans text-[10px] text-[#4F6355]/60 dark:text-white/40">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaporation Summary Note */}
              <div className="mt-4 pt-3 border-t border-[#0F3D2E]/8 dark:border-white/10 flex items-center justify-between font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/70">
                <span className="flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
                  <span>Cumulative Evaporation: 30.0 mm/week</span>
                </span>
                <span className="text-[#8C6A4D] dark:text-amber-300 font-semibold">Low Waterlogging Risk</span>
              </div>
            </div>
          </div>

          {/* Right: Vertical Subterranean Soil Depth Profile (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 sm:p-7 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-[#8C6A4D] dark:text-[#a3e635]" />
                    <h3 className="font-serif text-xl font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                      Subterranean Depth Strata
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#FAF8F3] dark:bg-[#132C22] border border-[#0F3D2E]/10 dark:border-white/10 px-3 py-1 font-mono text-xs font-semibold text-[#4F6355] dark:text-emerald-100/70">
                    3 SENSOR DEPTHS
                  </span>
                </div>

                {/* Depth Selector Tabs */}
                <div className="mt-5 space-y-3.5">
                  {SOIL_LAYERS.map((layer, idx) => {
                    const isSelected = activeLayerIdx === idx;
                    return (
                      <div
                        key={layer.depth}
                        onClick={() => setActiveLayerIdx(idx)}
                        className={`cursor-pointer rounded-2xl p-4.5 transition-all duration-200 ${
                          isSelected
                            ? 'border-2 border-[#0F3D2E] dark:border-[#2AD58B] bg-[#FCF9F0] dark:bg-[#132C22] shadow-md -translate-x-1'
                            : 'border border-[#0F3D2E]/10 dark:border-white/10 bg-white dark:bg-[#0E221A] hover:bg-[#FAF8F3] dark:hover:bg-[#132C22]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                            DEPTH: {layer.depth}
                          </span>
                          <span className="rounded-full bg-[#E9FFEC] dark:bg-emerald-950/70 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0F3D2E] dark:text-emerald-300">
                            {layer.moisture}% MOISTURE
                          </span>
                        </div>
                        <h4 className="mt-1.5 font-serif text-base font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                          {layer.name}
                        </h4>
                        <p className="mt-1.5 font-sans text-xs sm:text-sm text-[#4F6355] dark:text-emerald-100/70 leading-relaxed">
                          {layer.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Stratum Telemetry Readout */}
              <div className="mt-6 rounded-2xl bg-[#FCF9F0] dark:bg-[#091f15] border border-[#0F3D2E]/10 dark:border-emerald-500/20 p-5 text-[#0F3D2E] dark:text-white transition-colors">
                <div className="flex items-center justify-between font-mono text-xs text-[#0F3D2E] dark:text-[#a3e635] font-bold">
                  <span>ACTIVE STRATUM: {activeLayer.depth}</span>
                  <span className="text-[#22C55E] dark:text-[#2AD58B]">STATUS: {activeLayer.status}</span>
                </div>
                <div className="mt-3.5 grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
                  <div className="rounded-xl bg-white dark:bg-white/5 p-2.5 border border-[#0F3D2E]/8 dark:border-white/5 shadow-xs">
                    <p className="text-[10px] text-[#4F6355] dark:text-white/70">TEMPERATURE</p>
                    <p className="mt-1 font-bold text-sm text-[#0F3D2E] dark:text-white">{activeLayer.temp}°C</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-white/5 p-2.5 border border-[#0F3D2E]/8 dark:border-white/5 shadow-xs">
                    <p className="text-[10px] text-[#4F6355] dark:text-white/70">SOIL TEXTURE</p>
                    <p className="mt-1 font-bold text-sm text-[#0F3D2E] dark:text-white truncate">{activeLayer.texture.split(' ')[0]}</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-white/5 p-2.5 border border-[#0F3D2E]/8 dark:border-white/5 shadow-xs">
                    <p className="text-[10px] text-[#4F6355] dark:text-white/70">EC SALINITY</p>
                    <p className="mt-1 font-bold text-sm text-[#0F3D2E] dark:text-white">{activeLayer.ec} dS/m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
