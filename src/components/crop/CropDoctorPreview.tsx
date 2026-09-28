import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Scan, ShieldCheck, ArrowRight, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { assetUrl } from '../../lib/assets.ts';

interface SpecimenData {
  id: string;
  name: string;
  crop: string;
  disease: string;
  confidence: number;
  stage: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  image: string;
  symptoms: string[];
  organicTreatments: { title: string; desc: string; timeline: string }[];
}

const SPECIMENS: SpecimenData[] = [
  {
    id: 'specimen-tomato',
    name: 'Tomato (Solanum lycopersicum)',
    crop: 'Tomato',
    disease: 'Early Blight (Alternaria solani)',
    confidence: 91.4,
    stage: 'Stage 2 • Moderate Foliar Spread',
    riskLevel: 'Moderate',
    image: assetUrl('/images/crop_leaf_disease.jpg'),
    symptoms: [
      'Concentric dark brown rings with chlorotic yellow halo',
      'Primary manifestation on lower older leaves',
      'Defoliation risk within 6-8 days if humidity exceeds 80%',
    ],
    organicTreatments: [
      {
        title: 'Cold-Pressed Neem Seed Kernel Extract (5%)',
        desc: 'Foliar spray during low-sunlight hours (06:00 or 17:30) disrupting fungal spore cell membranes.',
        timeline: 'Apply immediately, repeat after 5 days',
      },
      {
        title: 'Trichoderma harzianum Bio-Inoculant',
        desc: 'Biological mycoparasite that colonizes the rhizosphere and leaf surface, outcompeting Alternaria spores.',
        timeline: 'Soil drench 10g/L water at root base',
      },
      {
        title: 'Canopy Thinning & Air Circulation',
        desc: 'Prune infected lower foliage up to 20cm from soil line and dispose safely away from compost.',
        timeline: 'Within 24 hours before morning mist',
      },
    ],
  },
  {
    id: 'specimen-grape',
    name: 'Grapevine (Vitis vinifera)',
    crop: 'Grapevine',
    disease: 'Downy Mildew (Plasmopara viticola)',
    confidence: 88.7,
    stage: 'Early Inoculation • Oil Spots',
    riskLevel: 'Moderate',
    image: assetUrl('/images/crop_leaf_disease.jpg'),
    symptoms: [
      'Yellowish-green oil spots on upper leaf surfaces',
      'Delicate white fungal down on lower surface during humid nights',
      'Necrotic leaf patches emerging within 72 hours without barrier',
    ],
    organicTreatments: [
      {
        title: 'Bordeaux Mixture (1% Neutral Solution)',
        desc: 'Copper sulfate + slaked lime protective coating creating an inhospitable barrier against spore germination.',
        timeline: 'Apply before anticipated rainfall event',
      },
      {
        title: 'Bacillus subtilis Bio-Fungicide',
        desc: 'Beneficial bacterial strain producing natural lipopeptides that inhibit fungal mycelial expansion.',
        timeline: 'Weekly preventive foliar application',
      },
      {
        title: 'Canopy Aeration & Trellis Shoot Positioning',
        desc: 'Tuck growing shoots into vertical trellis wires and remove basal lateral leaves to reduce foliar micro-humidity.',
        timeline: 'Within 24 hours to maximize airflow',
      },
    ],
  },
];

export function CropDoctorPreview() {
  const [activeSpecimenIdx, setActiveSpecimenIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const specimen: SpecimenData = SPECIMENS[activeSpecimenIdx] || SPECIMENS[0]!;

  const triggerRescan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 900);
  };

  const switchSpecimen = () => {
    setActiveSpecimenIdx((prev) => (prev === 0 ? 1 : 0));
    triggerRescan();
  };

  return (
    <section
      id="crop-doctor"
      className="relative z-10 bg-[#FAF8F3] dark:bg-[#07130e] py-24 sm:py-32 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300"
      aria-labelledby="crop-doctor-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
              <Leaf className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#a3e635]" />
              <span>MULTIMODAL AI VISION DIAGNOSTICS</span>
            </div>

            <h2
              id="crop-doctor-heading"
              className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-5xl"
            >
              A photo can tell <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">a story.</span>
            </h2>

            <p className="mt-4 font-sans text-base text-[#4F6355] dark:text-emerald-100/70 sm:text-lg">
              Early detection prevents harvest loss. Upload any field photograph to identify foliar
              pathogens with bounding box localization and organic-first treatment protocols.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] px-6 py-3 text-xs font-semibold text-white dark:text-[#07130E] shadow-md transition-all hover:bg-[#175440] dark:hover:bg-[#34e095]"
            >
              <span>Launch Full Crop Doctor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Interactive Split Scanner & Protocol Workbench (Aligned Equal Height Grid) */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Interactive Leaf Specimen Scanner (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="relative overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                {/* Top Control Header */}
                <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E] dark:bg-[#a3e635] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                      AI VISION INSPECTOR
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={switchSpecimen}
                      className="inline-flex items-center gap-1 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-[#FAF8F3] dark:bg-[#132C22] px-3 py-1 text-xs font-semibold text-[#0F3D2E] dark:text-[#FAF8F3] hover:bg-white dark:hover:bg-[#1a382b] cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Switch Specimen</span>
                    </button>
                    <button
                      onClick={triggerRescan}
                      className="inline-flex items-center gap-1 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] px-3 py-1 text-xs font-semibold text-white dark:text-[#07130E] hover:bg-[#175440] dark:hover:bg-[#34e095] cursor-pointer"
                    >
                      <Scan className="h-3 w-3" />
                      <span>Rescan</span>
                    </button>
                  </div>
                </div>

                {/* Leaf Image Viewport with Bounding Boxes */}
                <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl border border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#091811]">
                  <img
                    src={specimen.image}
                    alt={`Crop disease scan of ${specimen.name}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Animated Scanning Bar */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-[#22C55E] dark:bg-[#a3e635] shadow-[0_0_12px_#22C55E] animate-bounce" />
                  )}

                  {/* AI Lesion Bounding Boxes */}
                  <div className="absolute top-[28%] left-[24%] h-[34%] w-[38%] rounded-xl border-2 border-dashed border-[#C2703F] dark:border-[#f97316] bg-[#C2703F]/10 backdrop-blur-[1px]">
                    <div className="absolute -top-3 left-2 rounded bg-[#C2703F] dark:bg-[#f97316] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                      LESION TARGET • 91%
                    </div>
                  </div>

                  <div className="absolute bottom-[22%] right-[18%] h-[26%] w-[30%] rounded-xl border-2 border-dashed border-[#B4791A] dark:border-amber-400 bg-[#B4791A]/10">
                    <div className="absolute -top-3 left-2 rounded bg-[#B4791A] dark:bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                      CHLOROTIC HALO
                    </div>
                  </div>

                  {/* Live Confidence Pill */}
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/40 dark:border-white/20 bg-white/95 dark:bg-black/85 px-3.5 py-1.5 font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#FAF8F3] shadow-sm backdrop-blur-md">
                    CONFIDENCE: {specimen.confidence}%
                  </div>
                </div>
              </div>

              {/* Diagnostic Summary Strip */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#FCF9F0] dark:bg-[#132C22] p-4 border border-[#0F3D2E]/8 dark:border-white/10">
                <div>
                  <p className="font-mono text-[10px] text-[#4F6355] dark:text-emerald-100/60 uppercase">Identified Pathogen</p>
                  <p className="font-serif text-base font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">{specimen.disease}</p>
                </div>
                <span className="rounded-full bg-[#FEF3C7] dark:bg-amber-950/70 px-3 py-1 font-mono text-xs font-semibold text-[#92400E] dark:text-amber-300">
                  {specimen.stage}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Organic-First Treatment Protocol (6 Cols, Stretched to Match Left Height) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#22C55E] dark:text-[#a3e635]" />
                    <h3 className="font-serif text-lg font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                      Organic-First Treatment Protocol
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#E9FFEC] dark:bg-emerald-950/70 px-3 py-1 font-mono text-xs font-semibold text-[#0F3D2E] dark:text-emerald-300">
                    NON-TOXIC
                  </span>
                </div>

                {/* Treatment Steps */}
                <div className="mt-4 space-y-3.5">
                  {specimen.organicTreatments.map((treatment, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#0F3D2E]/8 dark:border-white/10 bg-[#FCF9F0] dark:bg-[#132C22] p-4 transition-all hover:bg-white dark:hover:bg-[#1a382b]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-sans text-sm font-bold text-[#0F3D2E] dark:text-[#FAF8F3]">
                          {idx + 1}. {treatment.title}
                        </h4>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E] dark:text-[#a3e635]" />
                      </div>
                      <p className="mt-1.5 font-sans text-xs text-[#374B3E] dark:text-slate-200 leading-relaxed">
                        {treatment.desc}
                      </p>
                      <div className="mt-2 font-mono text-[11px] font-semibold text-[#8C6A4D] dark:text-[#d9f99d]">
                        TIMELINE: {treatment.timeline}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventative Warning Note pinned neatly to bottom */}
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FEF3C7]/60 dark:bg-amber-950/40 border border-[#B4791A]/20 dark:border-amber-500/30 p-4">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#B4791A] dark:text-amber-400 mt-0.5" />
                <p className="font-sans text-xs text-[#92400E] dark:text-amber-200 leading-relaxed">
                  <strong>Preventive Warning:</strong> High relative humidity (&gt;75%) forecasted over the next 48 hours. Ensure adequate plant spacing to facilitate rapid foliar drying after morning dew.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
