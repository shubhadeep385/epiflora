import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { ThreeGlobe, BRICS_HUBS } from './ThreeGlobe.tsx';

export function BRICSGlobeSection() {
  const [selectedHub, setSelectedHub] = useState(0);
  const activeHub = BRICS_HUBS[selectedHub] ?? BRICS_HUBS[0]!;

  return (
    <section
      id="brics-network"
      className="relative z-10 bg-[#FCF9F0] dark:bg-[#07130e] py-24 sm:py-32 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300"
      aria-labelledby="globe-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
              <Globe2 className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#a3e635]" />
              <span>FEDERATED BRICS KNOWLEDGE NETWORK</span>
            </div>

            <h2
              id="globe-heading"
              className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-5xl"
            >
              One network. <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">Five sovereign hubs.</span>
            </h2>

            <p className="mt-4 font-sans text-base text-[#4F6355] dark:text-emerald-100/70 sm:text-lg">
              Agricultural intelligence shouldn't exist in silos. EpiFlora securely federates disease
              patterns, drought resilience models, and regenerative benchmarks across highlighted BRICS agricultural nodes in real time.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <Link
              to="/network"
              className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] px-6 py-3 text-xs font-semibold text-white dark:text-[#07130E] shadow-md transition-all hover:bg-[#175440] dark:hover:bg-[#34e095]"
            >
              <span>Explore Network Telemetry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 3D Realistic Earth Globe & Regional Hub Bento Container */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#0B1F17] dark:via-[#081812] dark:to-[#040C09] p-6 sm:p-10 shadow-xl dark:shadow-2xl text-[#0F3D2E] dark:text-white transition-colors duration-300">
          {/* Country Hub Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0F3D2E]/10 dark:border-white/10 pb-6">
            <div className="flex flex-wrap gap-2.5">
              {BRICS_HUBS.map((hub, idx) => {
                const isSelected = selectedHub === idx;
                return (
                  <button
                    key={hub.name}
                    onClick={() => setSelectedHub(idx)}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F3D2E] text-white dark:bg-[#2AD58B] dark:text-[#07150F] shadow-md dark:shadow-[0_0_20px_rgba(42,213,139,0.45)] font-bold scale-105'
                        : 'border border-[#0F3D2E]/15 bg-[#FAF8F3] text-[#4F6355] hover:bg-[#F4F1E8] hover:text-[#0F3D2E] dark:border-white/15 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/20 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-base">{hub.flag}</span>
                    <span>{hub.name}</span>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#07150F] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#4F6355] dark:text-white/60">
              <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-ping" />
              <span>5 BRICS FLORAS ONLINE • SATELLITE TELEMETRY</span>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left: 3D Interactive WebGL Realistic Earth Globe (7 Cols) */}
            <div className="relative flex items-center justify-center lg:col-span-7 rounded-2xl bg-[#FAF8F3] dark:bg-black/20 border border-[#0F3D2E]/10 dark:border-white/5 p-2 transition-colors">
              <ThreeGlobe activeHubIndex={selectedHub} onSelectHub={setSelectedHub} />

              <div className="absolute bottom-3 left-3 rounded-full border border-[#0F3D2E]/15 dark:border-white/20 bg-white/95 dark:bg-black/75 px-3 py-1.5 font-mono text-[10px] text-[#0F3D2E] dark:text-white/90 shadow-sm backdrop-blur-md flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] animate-pulse" />
                <span>DRAG TO ROTATE REAL EARTH • CLICK PINS TO FLY</span>
              </div>

              <div className="absolute top-3 right-3 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white/90 dark:bg-black/60 px-3 py-1 font-mono text-[10px] text-[#4F6355] dark:text-white/70 shadow-sm backdrop-blur-md">
                NASA BLUE MARBLE + ATMOSPHERE
              </div>
            </div>

            {/* Right: Selected Node Telemetry Details (5 Cols) */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-[#0F3D2E]/12 dark:border-white/15 bg-[#FCF9F0] dark:bg-white/10 p-6 backdrop-blur-xl shadow-md transition-colors">
                <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow">{activeHub.flag}</span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#0F3D2E] dark:text-white flex items-center gap-2">
                        {activeHub.name} Hub
                      </h3>
                      <p className="font-mono text-xs text-[#8C6A4D] dark:text-[#2AD58B] font-semibold">
                        LAT {activeHub.lat.toFixed(2)}° • LON {activeHub.lon.toFixed(2)}°
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#E9FFEC] dark:bg-[#2AD58B]/20 border border-[#22C55E]/30 dark:border-[#2AD58B]/50 px-3 py-1 font-mono text-[11px] font-bold text-[#0F3D2E] dark:text-[#2AD58B] flex items-center gap-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] animate-ping" />
                    ONLINE
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-mono text-[11px] text-[#4F6355] dark:text-white/60 uppercase tracking-wider">Primary Agronomy Focus</p>
                  <p className="mt-1 font-sans text-sm font-semibold text-[#0F3D2E] dark:text-white leading-relaxed">
                    {activeHub.focus}
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-[#0F3D2E]/10 dark:border-white/10 bg-white dark:bg-black/40 p-3.5">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#4F6355] dark:text-white/60 uppercase font-semibold">
                    <Activity className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
                    <span>Live Sovereign Telemetry Stream</span>
                  </div>
                  <p className="mt-1.5 font-sans text-xs text-[#172A1E] dark:text-white/90 leading-relaxed font-medium">
                    {activeHub.telemetry}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#0F3D2E]/10 dark:border-white/10 pt-4 font-mono text-xs">
                  <div className="rounded-xl bg-white dark:bg-black/30 p-3 border border-[#0F3D2E]/8 dark:border-white/5 shadow-xs">
                    <p className="text-[10px] text-[#4F6355] dark:text-white/60">SYNTHESIZED PATTERNS</p>
                    <p className="mt-1 font-bold text-[#0F3D2E] dark:text-[#2AD58B] text-base">
                      {activeHub.patterns.toLocaleString()} Patterns
                    </p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-black/30 p-3 border border-[#0F3D2E]/8 dark:border-white/5 shadow-xs">
                    <p className="text-[10px] text-[#4F6355] dark:text-white/60">FEDERATION LATENCY</p>
                    <p className="mt-1 font-bold text-[#0F3D2E] dark:text-white text-base">
                      {activeHub.latencyMs} ms
                    </p>
                  </div>
                </div>
              </div>

              {/* Security & Sovereign Protocol Badge */}
              <div className="flex items-start gap-3 rounded-2xl border border-[#0F3D2E]/10 dark:border-white/10 bg-[#FCF9F0] dark:bg-black/40 p-4 text-xs backdrop-blur-md shadow-xs">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#22C55E] dark:text-[#2AD58B] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#0F3D2E] dark:text-white flex items-center gap-1.5">
                    <span>Zero-Knowledge Sovereign Edge Federation</span>
                  </p>
                  <p className="font-sans text-[#4F6355] dark:text-white/75 leading-relaxed mt-1">
                    Only encrypted edge model weight updates and disease vectors are federated. Raw soil telemetry, farmer identities, and sovereign land boundaries never leave local jurisdiction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
