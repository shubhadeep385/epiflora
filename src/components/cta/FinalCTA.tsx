import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Mic, ShieldCheck, Sprout } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative z-10 overflow-hidden bg-[#FAF8F3] dark:bg-[#07130e] py-28 sm:py-36 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300">
      {/* Subtle atmospheric ambient glows that seamlessly blend into the page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#22C55E]/10 via-[#FAF8F3] to-[#C2703F]/10 dark:from-[#2AD58B]/10 dark:via-[#07130e] dark:to-[#8C6A4D]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/20 bg-white/80 dark:bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-xs">
          <Sprout className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#2AD58B]" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#0F3D2E] dark:text-white uppercase">
            INTELLIGENCE ROOTED IN THE LAND
          </span>
        </div>

        {/* Headline */}
        <h2 className="mt-8 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-white sm:text-5xl lg:text-6xl leading-[1.15]">
          Better intelligence. <br className="hidden sm:inline" />
          <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">Better decisions.</span> <br className="hidden sm:inline" />
          A more resilient future.
        </h2>

        <p className="mt-6 font-sans text-base sm:text-lg text-[#4F6355] dark:text-white/80 leading-relaxed max-w-2xl mx-auto">
          Open-source multimodal agricultural intelligence designed for farmers, agronomy advisors, and agricultural cooperatives
          to protect crop health and regenerate soil ecosystems.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/diagnose"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0F3D2E] text-white hover:bg-[#175440] dark:bg-[#2AD58B] dark:text-[#07150F] dark:hover:bg-[#34e095] px-8 py-4 text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <Leaf className="h-4 w-4 text-white dark:text-[#07150F]" />
            <span>Diagnose a Crop Now</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/ask"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#0F3D2E]/20 bg-white/80 text-[#0F3D2E] hover:bg-white dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 px-8 py-4 text-sm font-semibold backdrop-blur-sm transition-all duration-200 cursor-pointer shadow-xs"
          >
            <Mic className="h-4 w-4 text-[#C2703F] dark:text-[#2AD58B]" />
            <span>Speak with Voice Copilot</span>
          </Link>
        </div>

        {/* Trust Footer Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[#4F6355] dark:text-white/60">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#22C55E] dark:text-[#2AD58B]" />
            <span>Zero Subscription Lock-In</span>
          </div>
          <span>•</span>
          <div>Open Agricultural API</div>
          <span>•</span>
          <div>Works in Low-Connectivity Fields</div>
        </div>
      </div>
    </section>
  );
}
