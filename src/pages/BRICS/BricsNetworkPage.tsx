import { useState } from 'react';
import {
  Globe2,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Thermometer,
  Sprout,
  ShieldAlert,
  Share2,
  Server,
  CheckCircle2,
} from 'lucide-react';
import { NetworkMap } from '../../components/brics/NetworkMap.tsx';
import { BRICS_REGIONS, networkSummary, type RegionNode } from '../../lib/bricsDemoData.ts';
import { BRICS_HUBS } from '../../components/globe/ThreeGlobe.tsx';

const TREND_ICON = {
  rising: TrendingUp,
  stable: Minus,
  falling: TrendingDown,
} as const;

const TREND_CLASS = {
  rising: 'text-[#22C55E] dark:text-[#2AD58B]',
  stable: 'text-[#4F6355] dark:text-white/60',
  falling: 'text-[#EF4444] dark:text-rose-400',
} as const;

const RISK_CLASS = {
  low: 'bg-[#E9FFEC] text-[#0F3D2E] dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20',
  elevated: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/20',
  high: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/20',
} as const;

const TIER_LABEL: Record<RegionNode['tier'], { label: string; badge: string }> = {
  core: {
    label: 'Core Founding Member',
    badge: 'bg-[#E9FFEC] text-[#0F3D2E] dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-500/30',
  },
  member: {
    label: 'New Full Member State',
    badge: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/80 dark:text-amber-300 border-amber-500/30',
  },
  partner: {
    label: 'Partner Nation Hub',
    badge: 'bg-[#EFF6FF] text-[#1E40AF] dark:bg-blue-950/80 dark:text-blue-300 border-blue-500/30',
  },
};

function RegionDetail({ node }: { node: RegionNode }) {
  const TrendIcon = TREND_ICON[node.yieldTrend];
  const tierInfo = TIER_LABEL[node.tier] ?? TIER_LABEL.core;

  return (
    <div className="overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0A1C14] shadow-xl dark:shadow-2xl transition-colors duration-300">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#0F3D2E]/10 dark:border-white/10 p-6 sm:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl">{node.flag}</span>
            <span className="font-mono text-xs font-semibold text-[#4F6355] dark:text-emerald-100/70 uppercase">
              {node.countryName}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase border ${tierInfo.badge}`}
            >
              {tierInfo.label}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#0F3D2E] dark:text-white">
            {node.region}
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-[#FAF8F3] dark:bg-white/10 px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-white">
          <span className="h-2 w-2 rounded-full bg-[#22C55E] dark:bg-[#2AD58B] animate-pulse" />
          <span>FEDERATION SYNCHRONIZED</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-6 sm:p-8">
        <div className="rounded-2xl bg-[#FAF8F3] dark:bg-[#0E221A] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
          <p className="font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60 uppercase">Primary Crop</p>
          <p className="mt-1 font-serif text-lg font-bold text-[#0F3D2E] dark:text-white">{node.primaryCrop}</p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F3] dark:bg-[#0E221A] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
          <p className="font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60 uppercase">Secondary Crops</p>
          <p className="mt-1 font-sans text-sm font-semibold text-[#0F3D2E] dark:text-white truncate">
            {node.secondaryCrops.join(', ')}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F3] dark:bg-[#0E221A] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
          <p className="font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60 uppercase">Soil Stratum</p>
          <p className="mt-1 font-sans text-sm font-semibold text-[#0F3D2E] dark:text-white">
            {node.soilType} <span className="font-mono text-xs text-[#22C55E] dark:text-[#2AD58B]">({node.soilCondition})</span>
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F3] dark:bg-[#0E221A] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60 uppercase">
            <Droplets className="h-3.5 w-3.5 text-sky-500" />
            <span>Rain (30d)</span>
          </p>
          <p className="mt-1 font-serif text-lg font-bold text-[#0F3D2E] dark:text-white">{node.rainfall30dMm} mm</p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F3] dark:bg-[#0E221A] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60 uppercase">
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            <span>Average Temp</span>
          </p>
          <p className="mt-1 font-serif text-lg font-bold text-[#0F3D2E] dark:text-white">{node.averageTempC}°C</p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F3] dark:bg-[#0E221A] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
          <p className="font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/60 uppercase">Yield Velocity</p>
          <p className={`mt-1 font-serif text-lg font-bold flex items-center gap-1 ${TREND_CLASS[node.yieldTrend]}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{node.yieldChangePct > 0 ? '+' : ''}{node.yieldChangePct}%</span>
          </p>
        </div>
      </div>

      {/* Disease Risk & Sustainability Section */}
      <div className="grid gap-6 border-t border-[#0F3D2E]/10 dark:border-white/10 p-6 sm:p-8 sm:grid-cols-2 bg-[#FCF9F0] dark:bg-[#0E221A]/50">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs font-semibold text-[#4F6355] dark:text-emerald-100/70 uppercase">
            <ShieldAlert className="h-4 w-4 text-[#C2703F] dark:text-amber-400" />
            <span>Disease Risk Index</span>
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-3.5 py-1 text-xs font-bold uppercase ${RISK_CLASS[node.diseaseRisk]}`}
          >
            {node.diseaseRisk} Risk Profile
          </span>
        </div>

        <div>
          <p className="flex items-center gap-2 font-mono text-xs font-semibold text-[#4F6355] dark:text-emerald-100/70 uppercase">
            <Sprout className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
            <span>Sustainability & Carbon Benchmark</span>
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-serif text-xl font-bold text-[#0F3D2E] dark:text-white">
              {node.sustainabilityScore} / 100
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0F3D2E]/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#22C55E] dark:bg-[#2AD58B] transition-all duration-500"
                style={{ width: `${node.sustainabilityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Border Learning Payload */}
      <div className="border-t border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#0A1C14] p-6 sm:p-8">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#2AD58B] uppercase">
          <Share2 className="h-4 w-4" />
          <span>Exportable Regenerative Agricultural Practice</span>
        </div>
        <p className="mt-3 font-sans text-sm sm:text-base text-[#4F6355] dark:text-emerald-100/80 leading-relaxed">
          {node.sharedPractice}
        </p>
      </div>
    </div>
  );
}

export function BricsNetworkPage() {
  const [selectedId, setSelectedId] = useState<string>(BRICS_REGIONS[0]?.id ?? '');
  const [activeTier, setActiveTier] = useState<'all' | 'core' | 'member' | 'partner'>('all');

  const selected = BRICS_REGIONS.find((node) => node.id === selectedId) ?? BRICS_REGIONS[0]!;
  const summary = networkSummary();

  const filteredHubs =
    activeTier === 'all' ? BRICS_HUBS : BRICS_HUBS.filter((h) => h.tier === activeTier);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#0F3D2E]/10 dark:border-white/10 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
            <Globe2 className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#a3e635]" />
            <span>FEDERATED KNOWLEDGE NETWORK</span>
          </div>

          <h1 className="mt-4 font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0F3D2E] dark:text-white">
            Agricultural <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">Network</span>
          </h1>

          <p className="mt-4 font-sans text-base sm:text-lg text-[#4F6355] dark:text-emerald-100/70 leading-relaxed">
            Real-time agricultural model synthesis and sovereign data exchange across distributed planetary nodes.
            Connecting <strong>Founding Core 5</strong>, <strong>New Full Members</strong>, and <strong>Partner Nations</strong> to share pest vectors, drought genetics, and soil benchmarks with zero raw farm data leakage.
          </p>
        </div>
      </div>

      {/* Tier Filter Selector Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Federation (21)', count: summary.count },
              { id: 'core', label: 'Core Founding (5)', count: summary.coreCount },
              { id: 'member', label: 'New Full Members (6)', count: summary.memberCount },
              { id: 'partner', label: 'Partner Countries (10)', count: summary.partnerCount },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTier(id);
                if (id !== 'all') {
                  const firstInTier = BRICS_REGIONS.find((r) => r.tier === id);
                  if (firstInTier && selected.tier !== id) {
                    setSelectedId(firstInTier.id);
                  }
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTier === id
                  ? 'bg-[#0F3D2E] text-white dark:bg-[#2AD58B] dark:text-[#07130E] shadow-sm'
                  : 'bg-white dark:bg-[#0A1C14] border border-[#0F3D2E]/10 dark:border-white/10 text-[#4F6355] hover:text-[#0F3D2E] dark:text-white/70 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#4F6355] dark:text-emerald-100/70">
          <CheckCircle2 className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
          <span>Full Protocol Interoperability</span>
        </div>
      </div>

      {/* Main Interactive Map / Globe Showcase */}
      <NetworkMap
        regions={BRICS_REGIONS}
        selectedId={selectedId}
        onSelect={setSelectedId}
        activeTier={activeTier}
      />

      {/* Command Center Telemetry & Latency Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Synthesis Metrics Roll-up (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:grid-cols-2">
          {[
            {
              label: 'Federated Nodes',
              value: String(summary.count),
              sub: '21 Sovereign Hubs Active',
              icon: Globe2,
            },
            {
              label: 'Crop Families Protected',
              value: String(summary.cropCount),
              sub: 'Wheat, Rice, Cotton, Coffee, Teff, Soy',
              icon: Sprout,
            },
            {
              label: 'Surveillance Vectors',
              value: `${summary.atRisk} of ${summary.count}`,
              sub: 'Multi-Elevation Pathogen Alert',
              icon: ShieldAlert,
            },
            {
              label: 'Avg Carbon & Bio Score',
              value: `${summary.avgSustainability} / 100`,
              sub: '+16.8% Cross-Border Regeneration',
              icon: TrendingUp,
            },
          ].map(({ label, value, sub, icon: Icon }) => (
            <div
              key={label}
              className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0A1C14] p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-[#4F6355] dark:text-emerald-100/60 uppercase">{label}</p>
                <Icon className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
              </div>
              <div className="mt-4">
                <p className="font-serif text-3xl font-bold text-[#0F3D2E] dark:text-white">{value}</p>
                <p className="mt-1 font-sans text-xs text-[#4F6355] dark:text-white/60">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Node Latency Matrix (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0A1C14] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
              <h3 className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-white uppercase">
                SOVEREIGN FLORA LATENCY
              </h3>
            </div>
            <span className="rounded-full bg-[#E9FFEC] dark:bg-emerald-950/70 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0F3D2E] dark:text-emerald-300">
              {filteredHubs.length} FLORAS (AVG 27ms)
            </span>
          </div>

          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
            {filteredHubs.map((hub) => {
              const matchedRegion = BRICS_REGIONS.find((r) => r.countryName === hub.name || r.countryCode === hub.countryCode);
              const isSelected = matchedRegion && matchedRegion.id === selectedId;
              return (
                <div
                  key={hub.id}
                  onClick={() => matchedRegion && setSelectedId(matchedRegion.id)}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#22C55E] bg-[#E9FFEC]/80 dark:border-[#2AD58B] dark:bg-emerald-950/60'
                      : 'bg-[#FAF8F3] dark:bg-[#0E221A] border-[#0F3D2E]/6 dark:border-white/8 hover:border-[#22C55E]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{hub.flag}</span>
                    <div>
                      <p className="font-sans text-xs font-bold text-[#0F3D2E] dark:text-white">{hub.name}</p>
                      <p className="font-mono text-[10px] text-[#4F6355] dark:text-emerald-100/60">{hub.city.split('/')[0]}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#22C55E] dark:text-[#2AD58B]">
                    {hub.latencyMs}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Sovereign Regional Node Detail */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#0F3D2E] dark:text-white">
          Sovereign Node Intelligence Detail
        </h2>
        <RegionDetail node={selected} />
      </div>
    </div>
  );
}
