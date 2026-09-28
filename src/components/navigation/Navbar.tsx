import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mic, Activity, Globe2, Sprout, Menu, X, ArrowRight } from 'lucide-react';
import { LogoMark } from '../ui/Logo.tsx';
import { ThemeToggle } from '../ui/ThemeToggle.tsx';

interface NavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'signals', label: 'Signals', icon: Activity },
  { id: 'crop-doctor', label: 'Crop Doctor', icon: Leaf },
  { id: 'voice-copilot', label: 'Voice AI', icon: Mic },
  { id: 'weather-soil', label: 'Weather & Soil', icon: Activity },
  { id: 'brics-network', label: 'BRICS Network', icon: Globe2 },
  { id: 'soil-biome', label: 'Living Soil', icon: Sprout },
];

export function Navbar({ onNavigateSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled(isScrolled);

      const sections = ['hero', 'signals', 'crop-doctor', 'voice-copilot', 'weather-soil', 'brics-network', 'soil-biome'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF8F3]/92 dark:bg-[#07130E]/92 backdrop-blur-md border-b border-[#0F3D2E]/10 dark:border-white/10 py-3 shadow-md'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            className="group flex items-center gap-3 focus:outline-none"
            aria-label="EpiFlora Home"
          >
            <div className="flex items-center justify-center transition-transform group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(15,61,46,0.25)]">
              <LogoMark className="h-10 w-10" />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif text-xl font-bold tracking-tight transition-colors ${
                  !scrolled
                    ? 'text-white drop-shadow-sm'
                    : 'text-[#0F3D2E] dark:text-[#FAF8F3]'
                }`}
              >
                Epi
                <span
                  className={`font-light transition-colors ${
                    !scrolled
                      ? 'text-[#d9f99d]'
                      : 'text-[#8C6A4D] dark:text-[#a3e635]'
                  }`}
                >
                  Flora
                </span>
              </span>
              <span
                className={`font-mono text-[9px] tracking-widest uppercase transition-colors ${
                  !scrolled
                    ? 'text-white/80'
                    : 'text-[#0F3D2E]/70 dark:text-white/60'
                }`}
              >
                Epicultural Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className={`hidden lg:flex items-center gap-1 rounded-full p-1.5 backdrop-blur-md shadow-sm transition-all duration-300 ${
              !scrolled
                ? 'border border-white/20 bg-black/40 text-white'
                : 'border border-[#0F3D2E]/10 dark:border-white/15 bg-white/90 dark:bg-[#0E221A]/90'
            }`}
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? !scrolled
                        ? 'bg-[#c8f53c] text-[#07150F] font-bold shadow-sm'
                        : 'bg-[#0F3D2E] dark:bg-[#2AD58B] text-white dark:text-[#07130E] shadow-sm'
                      : !scrolled
                      ? 'text-white/80 hover:text-white hover:bg-white/15'
                      : 'text-[#5C6B64] dark:text-emerald-100/70 hover:text-[#0F3D2E] dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#132C22]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle
              className={
                !scrolled
                  ? '!bg-black/40 !border-white/25 !text-white hover:!bg-black/60 shadow-sm'
                  : ''
              }
            />

            <Link
              to="/diagnose"
              className={`hidden xl:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                !scrolled
                  ? 'border border-white/25 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md shadow-sm'
                  : 'border border-[#0F3D2E]/20 dark:border-white/20 bg-white dark:bg-[#0E221A] text-[#0F3D2E] dark:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#132C22]'
              }`}
            >
              <Leaf className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#a3e635]" />
              <span>Diagnose Crop</span>
            </Link>

            <Link
              to="/dashboard"
              className={`group inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-md transition-all cursor-pointer ${
                !scrolled
                  ? 'bg-[#c8f53c] text-[#07150F] hover:bg-[#d9ff55] font-bold hover:shadow-lg'
                  : 'bg-[#0F3D2E] dark:bg-[#2AD58B] text-white dark:text-[#07130E] hover:bg-[#175440] dark:hover:bg-[#34e095] hover:shadow-lg'
              }`}
            >
              <span>Open EpiFlora</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle
              className={
                !scrolled
                  ? '!bg-black/40 !border-white/25 !text-white hover:!bg-black/60 shadow-sm'
                  : ''
              }
            />
            <Link
              to="/dashboard"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                !scrolled
                  ? 'bg-[#c8f53c] text-[#07150F] font-bold shadow-sm'
                  : 'bg-[#0F3D2E] dark:bg-[#2AD58B] text-white dark:text-[#07130E]'
              }`}
            >
              Open App
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                !scrolled
                  ? 'border border-white/25 bg-black/40 text-white backdrop-blur-md'
                  : 'border border-[#0F3D2E]/15 dark:border-white/20 bg-white dark:bg-[#0E221A] text-[#0F3D2E] dark:text-white'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3]/98 dark:bg-[#07130E]/98 px-4 pt-4 pb-6 backdrop-blur-xl">
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#172A1E] dark:text-white hover:bg-white dark:hover:bg-[#0E221A]"
                >
                  <Icon className="h-4 w-4 text-[#0F3D2E] dark:text-[#2AD58B]" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <div className="pt-4 mt-2 border-t border-[#0F3D2E]/10 dark:border-white/10 flex flex-col gap-2">
              <Link
                to="/diagnose"
                className="flex items-center justify-center gap-2 rounded-full border border-[#0F3D2E]/20 dark:border-white/20 bg-white dark:bg-[#0E221A] py-2.5 text-sm font-semibold text-[#0F3D2E] dark:text-white"
              >
                <Leaf className="h-4 w-4 text-[#22C55E] dark:text-[#a3e635]" />
                Diagnose a Crop
              </Link>
              <Link
                to="/ask"
                className="flex items-center justify-center gap-2 rounded-full bg-[#C2703F] py-2.5 text-sm font-semibold text-white"
              >
                <Mic className="h-4 w-4" />
                Ask Voice Copilot
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
