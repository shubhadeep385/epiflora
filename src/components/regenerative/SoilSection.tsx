import { useState, useEffect } from 'react';
import { Layers, Sprout, ArrowRight, TrendingUp, Activity, CheckCircle2, Waves, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore.ts';
import { assetUrl } from '../../lib/assets.ts';

interface PracticeItem {
  id: string;
  title: string;
  desc: string;
  carbon: string;
  rateValue: number; // t CO2e / ha / yr
  moistureBonus: string;
  microbialGain: string;
  status: string;
}

const PRACTICES: PracticeItem[] = [
  {
    id: 'cover-crop',
    title: 'Multispecies Cover Cropping',
    desc: 'Planting clover, tillage radish, and rye mixes between crop cycles to nourish subterranean mycorrhizal networks and prevent topsoil erosion.',
    carbon: '+1.8 t CO₂e / ha / year',
    rateValue: 1.8,
    moistureBonus: '+28% water holding capacity',
    microbialGain: '+42% glomalin protein density',
    status: 'Active Field Protocol',
  },
  {
    id: 'zero-till',
    title: 'Zero-Till Microbiome Preservation',
    desc: 'Preserving uninterrupted fungal hyphae matrices and natural capillary soil pores that protect moisture during severe summer heatwaves.',
    carbon: '+2.4 t CO₂e / ha / year',
    rateValue: 2.4,
    moistureBonus: '+35% evaporation reduction',
    microbialGain: '+56% mycorrhizal colonization',
    status: 'Verified Carbon Sink',
  },
  {
    id: 'biochar',
    title: 'Biochar & Compost Amendments',
    desc: 'Locking recalcitrant stable carbon into deep root horizons while boosting cation exchange capacity (CEC) and nutrient availability.',
    carbon: '+3.1 t CO₂e / ha / year',
    rateValue: 3.1,
    moistureBonus: '+40% nutrient retention index',
    microbialGain: '+68% microbial biomass carbon',
    status: 'High Sequestration Standard',
  },
];

export function SoilSection() {
  const [activeMetric, setActiveMetric] = useState(0);
  const [liveFluxOffset, setLiveFluxOffset] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(1);

  const storedSoil = useAppStore((state) => state.soil);
  const history = useAppStore((state) => state.history);
  const location = useAppStore((state) => state.location);

  // Dynamic baseline calculations derived from actual farm history & stored soil
  const baselineOffset = 118.4;
  const historyBonus = history.length * 1.85; // each verified crop health check factors into managed hectare sequestration
  const soilBonus = storedSoil?.organicCarbonPct?.value ? (storedSoil.organicCarbonPct.value * 8.5) : 12.6;
  const activePracticeBonus = (PRACTICES[activeMetric]?.rateValue ?? 1.8) * 3.4;

  const currentTotalOffset = baselineOffset + historyBonus + soilBonus + activePracticeBonus + liveFluxOffset;
  const carbonPricePerTon = 25.0;
  const currentCreditValue = Math.round(currentTotalOffset * carbonPricePerTon);
  const previousSeasonGain = (currentTotalOffset - baselineOffset).toFixed(1);

  const targetOffset = 185.0;
  const progressPercent = Math.min(100, Math.round((currentTotalOffset / targetOffset) * 100));

  // Continuous live sync ticker simulating real-time Eddy Covariance carbon flux telemetry
  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsSyncing(true);
      setLiveFluxOffset((prev) => +(prev + 0.004 + Math.random() * 0.003).toFixed(4));
      setSyncCount((prev) => prev + 1);

      const timer = window.setTimeout(() => {
        setIsSyncing(false);
      }, 600);
      return () => window.clearTimeout(timer);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  const locationLabel = location?.label ? location.label.split(',')[0] : 'Pune Sector 4';

  return (
    <section
      id="soil-biome"
      className="relative z-10 bg-[#FAF8F3] dark:bg-[#07130e] py-24 sm:py-32 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300"
      aria-labelledby="soil-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
              <Sprout className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#a3e635]" />
              <span>REGENERATIVE EPICULTURE & CONTINUOUS CARBON FLUX</span>
            </div>

            <h2
              id="soil-heading"
              className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-5xl"
            >
              Living soil. <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">Measurable carbon.</span>
            </h2>

            <p className="mt-4 font-sans text-base text-[#4F6355] dark:text-emerald-100/70 sm:text-lg">
              Healthy soil is a living biological organism. EpiFlora connects continuous eddy covariance flux sensors,
              rhizosphere root imaging, and historical baselines to track verifiable soil carbon gains in real time.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <Link
              to="/soil"
              className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] px-6 py-3 text-xs font-semibold text-white dark:text-[#07130E] shadow-md transition-all hover:bg-[#175440] dark:hover:bg-[#34e095]"
            >
              <span>Explore Soil Biome</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento Grid: Living Root Cross-Section (Left) + Continuous Sync Carbon Tracker (Right) */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left: High-Res Soil Cross-Section Bento (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 sm:p-7 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E] dark:bg-[#a3e635] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                    RHIZOSPHERE BIOME INSPECTION
                  </span>
                </div>
                <span className="rounded-full bg-[#E9FFEC] dark:bg-emerald-950/70 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0F3D2E] dark:text-emerald-300">
                  GLOMALIN ACTIVE
                </span>
              </div>

              <div className="relative mt-5 aspect-4/3 sm:aspect-square overflow-hidden rounded-2xl border border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#091811]">
                <img
                  src={assetUrl('/images/soil_roots.jpg')}
                  alt="Living soil roots and mycorrhizal fungi cross section"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute top-4 left-4 rounded-full border border-white/40 dark:border-white/20 bg-white/95 dark:bg-black/85 px-3.5 py-1.5 font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] shadow-sm backdrop-blur-md">
                  MYCORRHIZAL COVERAGE: 88.4%
                </div>

                <div className="absolute bottom-4 right-4 rounded-full border border-white/40 dark:border-white/20 bg-white/95 dark:bg-black/85 px-3.5 py-1.5 font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] shadow-sm backdrop-blur-md">
                  MICROBIAL RESPIRATION: OPTIMAL
                </div>
              </div>
            </div>

            {/* Bottom Soil Carbon Summary Strip */}
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-4.5 border border-[#0F3D2E]/8 dark:border-white/10">
              <div>
                <p className="font-mono text-[10px] text-[#4F6355] dark:text-emerald-100/60 uppercase">
                  Soil Organic Carbon (SOC)
                </p>
                <p className="font-serif text-lg font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                  {storedSoil?.organicCarbonPct?.value ? `${storedSoil.organicCarbonPct.value}%` : '2.48%'} (Target: 3.2%)
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#22C55E] dark:text-[#a3e635] flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +{previousSeasonGain} t accumulated
              </span>
            </div>
          </div>

          {/* Right: Continuous Telemetry Carbon Tracker & Active Practices (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4.5">
            {/* 1. Main Live Carbon Sequestration Tracker Card */}
            <div className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#C2703F] dark:text-amber-400" />
                  <h3 className="font-serif text-lg font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                    Carbon Sequestration Tracker
                  </h3>
                </div>

                {/* Continuous Live Sync Pulse Indicator */}
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-[#E9FFEC] dark:bg-emerald-950/70 px-3 py-1 font-mono text-[11px] font-semibold text-[#0F3D2E] dark:text-emerald-300">
                  <span className={`h-2 w-2 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] ${isSyncing ? 'scale-125 animate-ping' : ''}`} />
                  <span className="flex items-center gap-1">
                    {isSyncing ? 'SYNCING FLUX...' : 'LIVE CONTINUOUS SYNC'}
                  </span>
                </div>
              </div>

              {/* Stat Metric Boxes */}
              <div className="mt-5 grid grid-cols-2 gap-4 text-center">
                <div className="rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-4.5 border border-[#0F3D2E]/8 dark:border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#4F6355] dark:text-emerald-100/60">
                    <span>NET CARBON OFFSET</span>
                    <span className="text-[10px] text-[#22C55E] font-semibold">SYNC #{syncCount}</span>
                  </div>
                  <p className="mt-2 font-serif text-3xl sm:text-4xl font-extrabold text-[#0F3D2E] dark:text-[#FAF8F3] tracking-tight">
                    {currentTotalOffset.toFixed(1)} <span className="text-xl font-sans font-medium text-[#4F6355] dark:text-emerald-100/60">t</span>
                  </p>
                  <p className="mt-1 font-sans text-xs text-[#22C55E] dark:text-[#a3e635] font-semibold flex items-center justify-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{previousSeasonGain} t vs baseline (118.4 t)
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-4.5 border border-[#0F3D2E]/8 dark:border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#4F6355] dark:text-emerald-100/60">
                    <span>EST. CARBON CREDIT</span>
                    <span className="text-[10px] text-[#8C6A4D] dark:text-amber-300 font-semibold">$25/t</span>
                  </div>
                  <p className="mt-2 font-serif text-3xl sm:text-4xl font-extrabold text-[#8C6A4D] dark:text-amber-300 tracking-tight">
                    ${currentCreditValue.toLocaleString()}
                  </p>
                  <p className="mt-1 font-sans text-xs text-[#4F6355] dark:text-emerald-100/60">
                    BRICS Carbon Registry Verified
                  </p>
                </div>
              </div>

              {/* Dynamic Seasonal Progress Bar & Real-time Rate */}
              <div className="mt-5 rounded-2xl bg-[#FAF8F3] dark:bg-[#0A1C14] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
                <div className="flex items-center justify-between font-mono text-xs text-[#4F6355] dark:text-emerald-100/70">
                  <span className="flex items-center gap-1.5 font-bold text-[#0F3D2E] dark:text-white">
                    <Activity className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
                    <span>ANNUAL TARGET PROGRESS</span>
                  </span>
                  <span className="font-bold text-[#22C55E] dark:text-[#a3e635]">
                    {progressPercent}% ({currentTotalOffset.toFixed(1)} / {targetOffset} t)
                  </span>
                </div>

                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#0F3D2E]/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0F3D2E] via-[#22C55E] to-[#2AD58B] dark:from-[#175440] dark:via-[#2AD58B] dark:to-[#a3e635] transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#0F3D2E]/6 dark:border-white/5 font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60">
                  <span className="flex items-center gap-1">
                    <Waves className="h-3.5 w-3.5 text-sky-500" />
                    <span>Live Absorption Rate: +4.62 kg CO₂e/ha/day</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-[#22C55E]' : ''}`} />
                    <span>Synced with {locationLabel} Flux Tower</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Verified Regenerative Soil Practices List */}
            <div className="space-y-3">
              {PRACTICES.map((practice, idx) => {
                const isSelected = activeMetric === idx;
                return (
                  <div
                    key={practice.id}
                    onClick={() => setActiveMetric(idx)}
                    className={`cursor-pointer rounded-2xl p-4.5 transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-[#0F3D2E] dark:border-[#2AD58B] bg-white dark:bg-[#0E241B] shadow-md -translate-x-0.5'
                        : 'border border-[#0F3D2E]/10 dark:border-white/10 bg-white/70 dark:bg-[#0E221A]/70 hover:bg-white dark:hover:bg-[#0E241B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                          {practice.title}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
                        )}
                      </div>
                      <span className="rounded-full bg-[#E9FFEC] dark:bg-emerald-950/70 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#0F3D2E] dark:text-emerald-300">
                        {practice.carbon}
                      </span>
                    </div>

                    <p className="mt-1.5 font-sans text-xs text-[#4F6355] dark:text-emerald-100/70 leading-relaxed">
                      {practice.desc}
                    </p>

                    {isSelected && (
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#0F3D2E]/8 dark:border-white/10 pt-2.5 font-mono text-[11px] text-[#0F3D2E] dark:text-[#FAF8F3]">
                        <span className="text-[#22C55E] dark:text-[#a3e635] font-semibold">
                          • {practice.moistureBonus}
                        </span>
                        <span className="text-[#8C6A4D] dark:text-amber-300 font-semibold">
                          • {practice.microbialGain}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

