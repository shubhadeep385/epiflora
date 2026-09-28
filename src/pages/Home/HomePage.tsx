import { SmoothScroll } from '../../components/scroller/SmoothScroll.tsx';
import { Navbar } from '../../components/navigation/Navbar.tsx';
import { Hero } from '../../components/hero/Hero.tsx';
import { FarmSignalsSection } from '../../components/signals/FarmSignalsSection.tsx';
import { CropDoctorPreview } from '../../components/crop/CropDoctorPreview.tsx';
import { VoiceCopilotPreview } from '../../components/voice/VoiceCopilotPreview.tsx';
import { WeatherIntelligence } from '../../components/weather/WeatherIntelligence.tsx';
import { BRICSGlobeSection } from '../../components/globe/BRICSGlobeSection.tsx';
import { SoilSection } from '../../components/regenerative/SoilSection.tsx';
import { FinalCTA } from '../../components/cta/FinalCTA.tsx';
import { HackathonHonors } from '../../components/home/HackathonHonors.tsx';
import { Footer } from '../../components/footer/Footer.tsx';

export function HomePage() {
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F3] dark:bg-[#07130e] text-[#0F3D2E] dark:text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-700 dark:selection:text-emerald-200 transition-colors duration-300">
      {/* Smooth Scroll Scrollytelling Container */}
      <SmoothScroll>
        {/* Navigation Bar */}
        <Navbar onNavigateSection={handleNavigateSection} />

        {/* Continuous Cinematic Sections */}
        <main id="main" className="relative">
          {/* Hero 3D Farmland Experience */}
          <Hero onScrollToExplore={() => handleNavigateSection('signals')} />

          {/* Section 2: Multi-Signal Telemetry */}
          <FarmSignalsSection />

          {/* Section 3: Crop Doctor Multimodal Scanner */}
          <CropDoctorPreview />

          {/* Section 4: Sarvam AI Multilingual Voice Copilot */}
          <VoiceCopilotPreview />

          {/* Section 5: Microclimate & Subterranean Soil Stratification */}
          <WeatherIntelligence />

          {/* Section 6: BRICS Interactive 3D Globe Network */}
          <BRICSGlobeSection />

          {/* Section 7: Regenerative Agriculture & Rhizosphere Roots */}
          <SoilSection />

          {/* Section 8: Final Dramatic CTA */}
          <FinalCTA />
        </main>

        {/* Global Platform Footer */}
        <Footer />
      </SmoothScroll>
    </div>
  );
}
