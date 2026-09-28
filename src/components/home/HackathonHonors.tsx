import { useState, useRef, type MouseEvent } from 'react';
import { Globe2, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { assetUrl } from '../../lib/assets.ts';

interface HonorCardProps {
  logoSrc: string;
  logoAlt: string;
  badgeText: string;
  badgeStyle: string;
  title: string;
  titleAccent?: string;
  description: React.ReactNode;
  footerBadges: {
    icon: React.ElementType;
    iconColor: string;
    iconHoverAnimation: string;
    label: string;
  }[];
  activeStatus: string;
  accentGlow: string;
  spotlightColor: string;
  borderHoverColor: string;
}

function HonorCard({
  logoSrc,
  logoAlt,
  badgeText,
  badgeStyle,
  title,
  titleAccent,
  description,
  footerBadges,
  activeStatus,
  accentGlow,
  spotlightColor,
  borderHoverColor,
}: HonorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTilt({ rotateX, rotateY });
    setCursorPos({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0A1C14] p-8 shadow-lg transition-all duration-300 ease-out flex flex-col justify-between cursor-default select-none ${
        isHovered
          ? `shadow-2xl -translate-y-2.5 ${borderHoverColor}`
          : 'hover:shadow-xl'
      }`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.015, 1.015, 1.015)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered
          ? 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease'
          : 'transform 0.5s ease-in-out, box-shadow 0.5s ease, border-color 0.3s ease',
      }}
    >
      {/* Dynamic Cursor-Following Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(350px circle at ${cursorPos.x}px ${cursorPos.y}px, ${spotlightColor}, transparent 70%)`
            : 'none',
        }}
      />

      {/* Ambient Corner Background Glow */}
      <div
        className={`absolute top-0 right-0 h-56 w-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${accentGlow} ${
          isHovered ? 'scale-150 opacity-90' : 'opacity-40'
        }`}
      />

      {/* Diagonal Shimmer Light Sweep on Hover */}
      <div
        className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent transition-transform duration-1000 ease-in-out ${
          isHovered ? 'translate-x-full' : ''
        }`}
      />

      <div className="relative z-10">
        {/* Header with Animated Emblem */}
        <div className="flex items-center justify-between gap-4 border-b border-[#0F3D2E]/10 dark:border-white/10 pb-6">
          <div className="flex items-center gap-4">
            {/* Logo Box with 3D Spring Lift & Glow Ring */}
            <div className="relative flex items-center justify-center">
              <div
                className={`absolute -inset-1.5 rounded-2xl opacity-0 blur-md transition-all duration-500 ${
                  isHovered ? 'opacity-70 scale-110' : ''
                } ${spotlightColor ? 'bg-gradient-to-r from-emerald-500/40 via-lime-400/40 to-blue-500/40' : ''}`}
              />
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white dark:bg-black/50 p-2.5 border border-[#0F3D2E]/10 dark:border-white/15 shadow-sm flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md">
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border uppercase transition-colors duration-300 ${badgeStyle} ${
                    isHovered ? 'shadow-xs' : ''
                  }`}
                >
                  {badgeText}
                </span>
              </div>
              <h3 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-[#0F3D2E] dark:text-white transition-colors group-hover:text-emerald-900 dark:group-hover:text-emerald-100">
                {title}{' '}
                {titleAccent && (
                  <span className="font-light text-[#8C6A4D] dark:text-[#a3e635]">
                    {titleAccent}
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Dynamic Active Status Pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-wider transition-all duration-300 ${
              isHovered
                ? 'bg-[#E9FFEC] dark:bg-emerald-950/90 text-[#0F3D2E] dark:text-[#2AD58B] border border-emerald-500/40 shadow-xs scale-105'
                : 'bg-[#FAF8F3] dark:bg-white/5 text-[#4F6355] dark:text-white/60 border border-transparent'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isHovered ? 'bg-[#22C55E] dark:bg-[#2AD58B] animate-ping' : 'bg-[#22C55E]'
              }`}
            />
            <span>{activeStatus}</span>
          </div>
        </div>

        {/* Description Body */}
        <p className="mt-6 font-sans text-sm text-[#4F6355] dark:text-emerald-100/80 leading-relaxed transition-colors group-hover:text-[#172A1E] dark:group-hover:text-emerald-100">
          {description}
        </p>
      </div>

      {/* Badges Footer with Interactive Micro-Animations */}
      <div className="relative z-10 mt-8 pt-6 border-t border-[#0F3D2E]/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#4F6355] dark:text-emerald-100/60">
        {footerBadges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 rounded-full px-2.5 py-1 transition-all duration-300 ${
                isHovered
                  ? 'bg-[#FAF8F3] dark:bg-white/10 text-[#0F3D2E] dark:text-white scale-102'
                  : ''
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-500 ${badge.iconColor} ${
                  isHovered ? badge.iconHoverAnimation : ''
                }`}
              />
              <span className="font-semibold">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HackathonHonors() {
  return (
    <section className="relative z-10 py-16 sm:py-20 bg-[#FAF8F3] dark:bg-[#06120c] border-t border-[#0F3D2E]/10 dark:border-white/10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-4 py-1.5 shadow-xs">
            <Globe2 className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
            <span className="font-mono text-xs font-semibold tracking-wider text-[#0F3D2E] dark:text-[#FAF8F3] uppercase">
              POWERED BY & BUILT FOR
            </span>
          </div>

          <h2 className="mt-4 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#0F3D2E] dark:text-white">
            <span className="italic text-[#2563EB] dark:text-[#60A5FA]">Google Gemini</span>
          </h2>
          <p className="mt-3 font-sans text-sm sm:text-base text-[#4F6355] dark:text-emerald-100/70">
            Engineered at the intersection of sovereign multilateral cooperation and frontier multimodal AI intelligence.
          </p>
        </div>

        {/* Dual Honor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* BRICS 2026 Card */}
          <HonorCard
            logoSrc={assetUrl('/logos/brics_india_2026.png')}
            logoAlt="BRICS India 2026 Official Logo"
            badgeText="Summit & Federation"
            badgeStyle="bg-[#E9FFEC] dark:bg-emerald-950/80 text-[#0F3D2E] dark:text-emerald-300 border-emerald-500/20"
            title="BRICS India"
            titleAccent="2026"
            activeStatus="FEDERATED MESH ACTIVE"
            accentGlow="bg-gradient-to-br from-[#F97316]/25 via-[#22C55E]/20 to-[#3B82F6]/20"
            spotlightColor="rgba(34, 197, 94, 0.22)"
            borderHoverColor="hover:border-emerald-500/50 dark:hover:border-emerald-400/50"
            description={
              <>
                Dedicated to the <strong>BRICS 2026 agricultural cooperation framework</strong>. Connecting 21 sovereign nations across Asia, Africa, Latin America, and Eurasia to exchange localized agronomic models, drought genetics, and soil carbon metrics with <strong>zero farm data leakage</strong>.
              </>
            }
            footerBadges={[
              {
                icon: Globe2,
                iconColor: 'text-[#22C55E] dark:text-[#2AD58B]',
                iconHoverAnimation: 'rotate-45 scale-125',
                label: '21 Sovereign Hubs',
              },
              {
                icon: ShieldCheck,
                iconColor: 'text-[#22C55E] dark:text-[#2AD58B]',
                iconHoverAnimation: 'scale-125 stroke-[2.5]',
                label: 'Public Digital Good',
              },
            ]}
          />

          {/* Google Gemini Card */}
          <HonorCard
            logoSrc={assetUrl('/logos/google_gemini.png')}
            logoAlt="Google Gemini Official Logo"
            badgeText="Frontier AI Engine"
            badgeStyle="bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-500/20"
            title="Google"
            titleAccent="Gemini"
            activeStatus="GEMINI 3.5 FLASH INFERENCE"
            accentGlow="bg-gradient-to-br from-[#3B82F6]/30 via-[#8B5CF6]/25 to-[#EC4899]/25"
            spotlightColor="rgba(59, 130, 246, 0.24)"
            borderHoverColor="hover:border-blue-500/50 dark:hover:border-blue-400/50"
            description={
              <>
                Powered by <strong>Google Gemini Multimodal AI</strong> (Gemini 3.5 Flash Lite, Gemini 3.1 Flash Lite & Gemini 3.7 Flash). Processing leaf imagery, symptom context, and high-frequency sensor readings to deliver deterministic, dosage-safe agricultural advisories in <strong>21 native languages</strong>.
              </>
            }
            footerBadges={[
              {
                icon: Cpu,
                iconColor: 'text-blue-500 dark:text-blue-400',
                iconHoverAnimation: 'scale-125 rotate-12',
                label: 'Multimodal Vision & Audio',
              },
              {
                icon: Sparkles,
                iconColor: 'text-amber-500 dark:text-amber-400',
                iconHoverAnimation: 'scale-130 rotate-180',
                label: 'Strict Safety Scrubber',
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
