import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { LogoMark } from '../ui/Logo.tsx';
import { assetUrl } from '../../lib/assets.ts';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#050e0a] py-16 text-[#0F3D2E] dark:text-[#FAF8F3] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex items-center justify-center transition-transform group-hover:scale-105 drop-shadow-sm">
                <LogoMark className="h-9 w-9" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3]">
                Epi<span className="text-[#8C6A4D] dark:text-[#a3e635]">Flora</span>
              </span>
            </Link>
            <p className="font-sans text-sm text-[#4F6355] dark:text-emerald-100/70 max-w-sm leading-relaxed">
              Intelligence rooted in the land. Multimodal agricultural AI platform connecting crop diagnostics,
              soil microbiology, and weather telemetry across farming networks.
            </p>

            {/* Official Hackathon Honors Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 rounded-xl border border-[#0F3D2E]/10 dark:border-white/10 bg-white dark:bg-[#0A1C14] px-3 py-1.5 shadow-xs">
                <img
                  src={assetUrl('/logos/google_gemini.png')}
                  alt="Google Gemini"
                  className="h-5 w-auto object-contain"
                />
                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Google Gemini
                </span>
              </div>
            </div>

            <div className="pt-1 font-mono text-[11px] text-[#4F6355] dark:text-emerald-100/50">
              Team Astra
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] uppercase tracking-wider">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 font-sans text-sm text-[#4F6355] dark:text-emerald-100/70">
              <li>
                <Link to="/diagnose" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  Crop Doctor AI
                </Link>
              </li>
              <li>
                <Link to="/ask" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  Multilingual Voice Copilot
                </Link>
              </li>
              <li>
                <Link to="/weather" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  Weather & Evapotranspiration
                </Link>
              </li>
              <li>
                <Link to="/soil" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  Subterranean Soil Biome
                </Link>
              </li>
              <li>
                <Link to="/network" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  Agri Knowledge Federation
                </Link>
              </li>
            </ul>
          </div>

          {/* BRICS Knowledge Hubs */}
          <div>
            <h4 className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] uppercase tracking-wider">
              Agronomy Hubs
            </h4>
            <ul className="mt-4 space-y-2.5 font-sans text-sm text-[#4F6355] dark:text-emerald-100/70">
              <li className="flex items-center gap-2">
                <span>🇮🇳</span>
                <span>India (ICAR / Pune)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🇧🇷</span>
                <span>Brazil (Embrapa / Cerrado)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🇿🇦</span>
                <span>South Africa (ARC / Pretoria)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🇨🇳</span>
                <span>China (CAAS / Beijing)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🇷🇺</span>
                <span>Russia (Vavilov / Moscow)</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions & Back to Top */}
          <div>
            <h4 className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] uppercase tracking-wider">
              Resources
            </h4>
            <ul className="mt-4 space-y-2.5 font-sans text-sm text-[#4F6355] dark:text-emerald-100/70">
              <li>
                <Link to="/architecture" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#0F3D2E] dark:hover:text-[#2AD58B] transition-colors">
                  Field Configuration
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-1 text-[#0F3D2E] dark:text-[#2AD58B] font-semibold hover:underline cursor-pointer"
                >
                  <span>Back to Top</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & honors */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#0F3D2E]/10 dark:border-white/10 pt-8 font-mono text-xs text-[#4F6355] dark:text-emerald-100/60">
          <div>© {new Date().getFullYear()} EpiFlora Intelligence • Powered by Google Gemini</div>
          <div className="mt-2 sm:mt-0">Zero telemetry monetization • Farmer Privacy First • Open Digital Good</div>
        </div>
      </div>
    </footer>
  );
}
