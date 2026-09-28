import { Link } from 'react-router-dom';
import { ArrowUpRight, Mic, ChevronDown } from 'lucide-react';
import { AnimatedWheatVideo } from './AnimatedWheatVideo.tsx';

export interface HeroProps {
  onExploreClick?: () => void;
  onScrollToExplore?: () => void;
}

export function Hero({ onExploreClick, onScrollToExplore }: HeroProps) {
  const handleScroll = () => {
    if (onScrollToExplore) {
      onScrollToExplore();
    } else if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('signals');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] w-full flex flex-col justify-between overflow-hidden bg-[#07130e]"
      aria-label="EpiFlora Flagship Hero"
    >
      {/* Full-Page Edge-to-Edge Animated Wheat Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <AnimatedWheatVideo />

        {/* Readability Vignette & Contrast Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07130e] via-black/35 to-black/50 z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60 z-10" />
      </div>

      {/* Main Content Container Layer */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-12 flex flex-col justify-between flex-grow min-h-[100svh]">
        {/* Top Header Row inside Hero */}
        <div className="flex items-center justify-between w-full">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#a3e635] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-white uppercase">
              MULTIMODAL EPICULTURAL INTELLIGENCE • BRICS
            </span>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="my-auto max-w-3xl pt-10 pb-6 text-left">
          {/* Title with Italic Serif Accent */}
          <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]">
            Smart Farming for <br />
            Future{' '}
            <span className="font-serif italic font-normal text-[#d9f99d] drop-shadow-md">
              Generations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl font-sans text-base sm:text-lg md:text-xl text-white/90 leading-relaxed font-normal">
            EpiFlora combines multimodal AI, weather intelligence, soil insights, and farmer-first voice
            interaction to turn complex agricultural data into practical, sustainable decisions.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8f53c] hover:bg-[#d9ff55] px-7 py-3.5 text-sm font-semibold text-[#0d1f14] shadow-lg shadow-lime-950/50 transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <span>Start Diagnosing</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </Link>

            <Link
              to="/ask"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 hover:bg-white/25 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <Mic className="h-4 w-4 text-[#d9f99d]" />
              <span>Ask Voice Copilot</span>
            </Link>
          </div>
        </div>

        {/* Bottom Hero Bar: Scroll & Farmer Rating Pill */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pt-4 border-t border-white/15">
            {/* Scroll Down */}
            <button
              onClick={handleScroll}
              className="group inline-flex items-center gap-2 font-mono text-xs font-semibold text-white/80 uppercase tracking-widest transition-colors hover:text-white cursor-pointer"
            >
              <span>SCROLL</span>
              <ChevronDown className="h-4 w-4 animate-bounce text-white/70 group-hover:text-white" />
            </button>

            {/* Live Sovereign Mesh Telemetry Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur-md shadow-md">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#a3e635]" />
              </span>
              <span className="font-mono text-xs font-semibold text-white/90">
                5 Sovereign BRICS Hubs Synchronized
              </span>
            </div>
          </div>

          {/* Bottom Open Agricultural Standards & Research Consortia Bar */}
          <div className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
            <p className="font-mono text-xs text-white/70 tracking-wider text-center md:text-left">
              Built on open data standards & research protocols from <strong className="text-white font-semibold">global agricultural consortia</strong>
            </p>

            {/* Real Scientific & Research Consortia Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-white/60 text-xs font-semibold tracking-wider uppercase font-mono">
              <span className="hover:text-white transition-colors" title="Indian Council of Agricultural Research">ICAR</span>
              <span>•</span>
              <span className="hover:text-white transition-colors" title="Food and Agriculture Organization of the United Nations">FAO</span>
              <span>•</span>
              <span className="hover:text-white transition-colors" title="Consultative Group on International Agricultural Research">CGIAR</span>
              <span>•</span>
              <span className="hover:text-white transition-colors" title="Empresa Brasileira de Pesquisa Agropecuária">EMBRAPA</span>
              <span>•</span>
              <span className="hover:text-white transition-colors" title="European Space Agency Sentinel-2 Earth Observation">COPERNICUS</span>
              <span>•</span>
              <span className="text-[#a3e635] hover:text-[#c8f53c] transition-colors" title="World Meteorological Organization Normalised Telemetry">WMO / OPEN-METEO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
