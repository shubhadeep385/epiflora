import { useState } from 'react';
import type { RegionNode } from '../../lib/bricsDemoData.ts';
import { ThreeGlobe, BRICS_HUBS } from '../globe/ThreeGlobe.tsx';
import { Globe2, Map, ShieldCheck, Wifi, Radio } from 'lucide-react';

interface NetworkMapProps {
  regions: RegionNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeTier?: 'all' | 'core' | 'member' | 'partner';
}

const RISK_COLOR: Record<RegionNode['diseaseRisk'], string> = {
  low: '#22C55E',
  elevated: '#EAB308',
  high: '#F97316',
};

// Auto-build hub index map
const HUB_INDEX_BY_CODE: Record<string, number> = {
  IN: 0,
  IND: 0,
  BR: 1,
  BRA: 1,
  ZA: 2,
  ZAF: 2,
  CN: 3,
  CHN: 3,
  RU: 4,
  RUS: 4,
  EG: 5,
  EGY: 5,
  ET: 6,
  ETH: 6,
  IR: 7,
  IRN: 7,
  SA: 8,
  SAU: 8,
  AE: 9,
  ARE: 9,
  ID: 10,
  IDN: 10,
  VN: 11,
  VNM: 11,
  TH: 12,
  THA: 12,
  MY: 13,
  MYS: 13,
  NG: 14,
  NGA: 14,
  KZ: 15,
  KAZ: 15,
  BY: 16,
  BLR: 16,
  BO: 17,
  BOL: 17,
  CU: 18,
  CUB: 18,
  UG: 19,
  UGA: 19,
  UZ: 20,
  UZB: 20,
};

export function NetworkMap({
  regions,
  selectedId,
  onSelect,
  activeTier = 'all',
}: NetworkMapProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const selectedNode = regions.find((r) => r.id === selectedId) ?? regions[0]!;
  const currentHubIndex = HUB_INDEX_BY_CODE[selectedNode.countryCode] ?? 0;

  const handleGlobeSelect = (idx: number) => {
    const hub = BRICS_HUBS[idx];
    if (hub) {
      const match = regions.find(
        (r) =>
          r.countryCode === hub.countryCode ||
          r.countryName.toLowerCase() === hub.name.toLowerCase() ||
          HUB_INDEX_BY_CODE[r.countryCode] === idx,
      );
      if (match) {
        onSelect(match.id);
      }
    }
  };

  const filteredRegions =
    activeTier === 'all' ? regions : regions.filter((r) => r.tier === activeTier);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0A1C14] shadow-xl dark:shadow-2xl transition-colors duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0F3D2E]/10 dark:border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]" />
          </span>
          <div>
            <h3 className="font-mono text-xs font-bold tracking-wider text-[#0F3D2E] dark:text-white uppercase">
              FEDERATED BRICS+ TELEMETRY NETWORK
            </h3>
            <p className="font-sans text-xs text-[#4F6355] dark:text-emerald-100/60">
              21 Sovereign Nodes across 5 Continents • Live model weight exchange
            </p>
          </div>
        </div>

        {/* Controls: View Mode Toggle */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-[#FAF8F3] dark:bg-white/10 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-[#0F3D2E] text-white dark:bg-[#2AD58B] dark:text-[#07130E] shadow-sm'
                : 'text-[#4F6355] hover:text-[#0F3D2E] dark:text-white/70 dark:hover:text-white'
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>3D Earth</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold transition-all cursor-pointer ${
              viewMode === '2d'
                ? 'bg-[#0F3D2E] text-white dark:bg-[#2AD58B] dark:text-[#07130E] shadow-sm'
                : 'text-[#4F6355] hover:text-[#0F3D2E] dark:text-white/70 dark:hover:text-white'
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>Grid Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Visualization Canvas */}
      <div className="relative min-h-[460px] sm:min-h-[540px] bg-[#FAF8F3] dark:bg-[#07130E] flex items-center justify-center transition-colors duration-300">
        {viewMode === '3d' ? (
          <div className="w-full h-full">
            <ThreeGlobe
              activeHubIndex={currentHubIndex}
              onSelectHub={handleGlobeSelect}
              activeTier={activeTier}
            />
          </div>
        ) : (
          <div className="w-full p-6 sm:p-8 flex flex-col justify-center">
            {/* High Precision Vector Grid */}
            <div className="relative w-full rounded-2xl border border-[#0F3D2E]/10 dark:border-white/10 bg-white/60 dark:bg-[#091811] p-6 shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {filteredRegions.map((node) => {
                  const isSelected = node.id === selectedId;
                  const hubIdx = HUB_INDEX_BY_CODE[node.countryCode] ?? 0;
                  const hub = BRICS_HUBS[hubIdx] ?? BRICS_HUBS[0]!;
                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelect(node.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#22C55E] bg-[#E9FFEC]/80 dark:border-[#2AD58B] dark:bg-emerald-950/50 shadow-md scale-102 ring-2 ring-[#22C55E]/30'
                          : 'border-[#0F3D2E]/10 bg-white dark:border-white/10 dark:bg-[#0E221A] hover:border-[#22C55E]/40 hover:bg-forest-50/40 dark:hover:bg-[#132C22]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{node.flag}</span>
                        <span
                          className="size-2 rounded-full animate-pulse"
                          style={{ backgroundColor: RISK_COLOR[node.diseaseRisk] }}
                          title={`Disease risk: ${node.diseaseRisk}`}
                        />
                      </div>

                      <div className="mt-3">
                        <p className="font-mono text-[10px] text-[#4F6355] dark:text-emerald-100/60 uppercase truncate">
                          {node.countryName}
                        </p>
                        <p className="font-serif text-xs font-bold text-[#0F3D2E] dark:text-white truncate">
                          {node.region.split('—')[0]}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#0F3D2E]/8 dark:border-white/10 flex items-center justify-between font-mono text-[10px]">
                        <span className="text-[#4F6355] dark:text-white/60 truncate">{node.primaryCrop}</span>
                        <span className="font-bold text-[#22C55E] dark:text-[#2AD58B] shrink-0 ml-1">
                          {hub.latencyMs}ms
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Arcs Visual Representation */}
              <div className="mt-6 rounded-xl bg-[#FCF9F0] dark:bg-[#132C22] p-4 border border-[#0F3D2E]/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#4F6355] dark:text-emerald-100/70">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B] animate-pulse" />
                  <span>Cross-Border Cryptographic Mesh Active</span>
                </div>
                <span>21 Sovereign Hubs Interconnected • 0 Leakage</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#07130E]/80 px-6 py-3.5 text-xs">
        <div className="flex items-center gap-4 font-mono text-[11px] text-[#4F6355] dark:text-white/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
            <span>Zero Raw Data Leakage Protocol</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
            <span>Multi-Hop Resilient Mesh</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-[#4F6355] dark:text-white/60">Risk Profile:</span>
          {(['low', 'elevated', 'high'] as const).map((level) => (
            <span key={level} className="inline-flex items-center gap-1.5 capitalize text-[#0F3D2E] dark:text-white">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: RISK_COLOR[level] }}
                aria-hidden="true"
              />
              {level}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
