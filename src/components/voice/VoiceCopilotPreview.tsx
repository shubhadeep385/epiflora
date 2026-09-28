import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Volume2, ArrowRight, Pause } from 'lucide-react';

interface DialectItem {
  lang: string;
  tag: string;
  flag: string;
  query: string;
  queryEn: string;
  pipeline: {
    asr: string;
    context: string;
    diagnosis: string;
    actionAudio: string;
  };
}

const DIALECT_QUERIES: DialectItem[] = [
  {
    lang: 'Hindi (हिंदी)',
    tag: 'hi-IN',
    flag: '🇮🇳',
    query: 'मेरी टमाटर की फसल की पत्तियां नीचे से पीली पड़ रही हैं और भूरे गोल धब्बे दिख रहे हैं, मुझे क्या करना चाहिए?',
    queryEn: '"The lower leaves of my tomato crop are turning yellow with brown target spots, what should I do?"',
    pipeline: {
      asr: 'Sarvam Saaras v3 • Hindi Recognized in 180ms',
      context: 'Tomato Crop • Loam Soil pH 6.4 • Humidity 78%',
      diagnosis: 'Early Blight (Alternaria solani) confirmed via foliar symptoms',
      actionAudio: 'नीम के बीज का काढ़ा 5% छिड़कें और पौधों के बीच हवा का संचार बढ़ाने के लिए निचली सूखी पत्तियों को काट लें।',
    },
  },
  {
    lang: 'Marathi (मराठी)',
    tag: 'mr-IN',
    flag: '🇮🇳',
    query: 'माझ्या कपाशीच्या पानांवर पांढऱ्या माश्यांचा प्रादुर्भाव वाढला आहे, सेंद्रिय उपाय काय आहे?',
    queryEn: '"Whitefly infestation has increased on my cotton leaves, what is the organic remedy?"',
    pipeline: {
      asr: 'Sarvam Saaras v3 • Marathi Recognized in 210ms',
      context: 'Cotton Crop • Black Cotton Soil • Temp 31°C',
      diagnosis: 'Whitefly (Bemisia tabaci) early stage pressure',
      actionAudio: 'एकरला १५ पिवळे चिकट सापळे लावा आणि निंबोळी अर्क ५% ची फवारणी करा.',
    },
  },
  {
    lang: 'Portuguese (Português)',
    tag: 'pt-BR',
    flag: '🇧🇷',
    query: 'Minhas folhas de soja estão com pequenas manchas avermelhadas após a chuva contínua.',
    queryEn: '"My soybean leaves have small reddish spots following continuous rain."',
    pipeline: {
      asr: 'Gemini Multimodal Audio • Portuguese Recognized in 190ms',
      context: 'Soybean • Cerrado Oxisol • 7-Day Rainfall 84mm',
      diagnosis: 'Asian Soybean Rust (Phakopsora pachyrhizi) alert',
      actionAudio: 'Aplique calda bordalesa preventiva e monitore a umidade do solo a 20cm.',
    },
  },
  {
    lang: 'Tamil (தமிழ்)',
    tag: 'ta-IN',
    flag: '🇮🇳',
    query: 'நெல் பயிரில் இலை நுனி கருகல் நோய் தென்படுகிறது, தண்ணீர் பாய்ச்சுவதை நிறுத்த வேண்டுமா?',
    queryEn: '"Rice leaf tip blight observed, should I stop irrigation?"',
    pipeline: {
      asr: 'Sarvam Saaras v3 • Tamil Recognized in 220ms',
      context: 'Paddy • Alluvial Clay • Field Water Level 4cm',
      diagnosis: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
      actionAudio: 'வயலில் தேங்கிய நீரை வடித்துவிட்டு, வேப்பம்பழ சாறு தெளிக்கவும்.',
    },
  },
];

export function VoiceCopilotPreview() {
  const [selectedLang, setSelectedLang] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const current: DialectItem = DIALECT_QUERIES[selectedLang] || DIALECT_QUERIES[0]!;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section
      id="voice-copilot"
      className="relative z-10 bg-[#FCF9F0] dark:bg-[#091811] py-24 sm:py-32 border-t border-[#0F3D2E]/8 dark:border-white/10 transition-colors duration-300"
      aria-labelledby="voice-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] px-3.5 py-1 text-xs font-mono font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">
              <Mic className="h-3.5 w-3.5 text-[#C2703F] dark:text-[#f97316]" />
              <span>SARVAM AI + GEMINI MULTIMODAL VOICE ENGINE</span>
            </div>

            <h2
              id="voice-heading"
              className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-5xl"
            >
              Just ask. <span className="italic text-[#8C6A4D] dark:text-[#d9f99d]">In your language.</span>
            </h2>

            <p className="mt-4 font-sans text-base text-[#4F6355] dark:text-emerald-100/70 sm:text-lg">
              No typing in the bright sun. Speak naturally in Hindi, Marathi, Tamil, Portuguese, or English.
              EpiFlora reasons across crop, soil, and weather context and speaks back.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] px-6 py-3 text-xs font-semibold text-white dark:text-[#07130E] shadow-md transition-all hover:bg-[#175440] dark:hover:bg-[#34e095]"
            >
              <span>Launch Voice Copilot</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Dialect Selector Tabs */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          {DIALECT_QUERIES.map((item, idx) => (
            <button
              key={item.tag}
              onClick={() => {
                setSelectedLang(idx);
                setIsPlaying(false);
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                selectedLang === idx
                  ? 'bg-[#0F3D2E] dark:bg-[#2AD58B] text-white dark:text-[#07130E] shadow-sm'
                  : 'border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] text-[#4F6355] dark:text-emerald-100/70 hover:bg-[#FAF8F3] dark:hover:bg-[#132C22] hover:text-[#0F3D2E] dark:hover:text-white'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.lang}</span>
            </button>
          ))}
        </div>

        {/* Interactive Voice Experience Bento Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Interactive Waveform & Mic Container (6 Cols) */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-8 shadow-sm lg:col-span-6 min-h-[400px]">
            {/* Ambient Pulse Ring */}
            <div
              className={`absolute h-64 w-64 rounded-full border border-[#22C55E]/20 dark:border-emerald-400/20 transition-all duration-700 ${
                isPlaying ? 'scale-110 opacity-70 animate-ping duration-1000' : 'opacity-20'
              }`}
            />

            {/* Central Mic Button */}
            <button
              onClick={togglePlay}
              className="group relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#0F3D2E] dark:bg-[#133827] text-white shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer border border-white/10"
              aria-label={isPlaying ? 'Pause Voice Simulation' : 'Play Voice Simulation'}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-[#2AD58B] dark:text-[#a3e635]" />
              ) : (
                <Mic className="h-8 w-8 text-[#2AD58B] dark:text-[#a3e635] transition-transform group-hover:scale-110" />
              )}
            </button>

            {/* Dynamic Sound Waveform Bars */}
            <div className="relative z-10 mt-8 flex h-14 items-center gap-1.5 px-6">
              {[20, 45, 75, 90, 60, 100, 80, 40, 65, 95, 70, 85, 30, 90, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#0F3D2E] dark:bg-[#2AD58B] transition-all duration-150"
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2)}%` : '25%',
                    opacity: isPlaying ? 0.9 : 0.4,
                  }}
                />
              ))}
            </div>

            <p className="mt-4 font-mono text-xs font-semibold tracking-wider text-[#0F3D2E] dark:text-[#FAF8F3] uppercase">
              {isPlaying ? '🎙 LISTENING & SYNTHESIZING IN REAL-TIME...' : 'CLICK ORB TO HEAR SAMPLE REASONING'}
            </p>
          </div>

          {/* Right: AI Pipeline Breakdown (6 Cols) */}
          <div className="space-y-4 lg:col-span-6 flex flex-col justify-between">
            {/* Spoken Query Bubble */}
            <div className="rounded-3xl border border-[#0F3D2E]/15 dark:border-white/15 bg-white dark:bg-[#0E221A] p-6 shadow-sm">
              <div className="flex items-center justify-between font-mono text-xs text-[#4F6355] dark:text-emerald-100/60">
                <span className="font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">FARMER INPUT ({current.lang})</span>
                <span className="rounded-full bg-[#FAF8F3] dark:bg-[#132C22] px-2.5 py-0.5 text-[11px] text-[#4F6355] dark:text-emerald-100/70">SARVAM ASR</span>
              </div>
              <p className="mt-3 font-serif text-lg font-medium text-[#0F3D2E] dark:text-[#FAF8F3] italic leading-snug">
                "{current.query}"
              </p>
              <p className="mt-2 font-sans text-xs text-[#4F6355] dark:text-emerald-100/60">
                {current.queryEn}
              </p>
            </div>

            {/* AI Diagnostics Steps */}
            <div className="rounded-3xl border border-[#0F3D2E]/10 dark:border-white/10 bg-white/80 dark:bg-[#0E221A]/80 p-5 font-mono text-xs space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-[#4F6355] dark:text-emerald-100/70">
                <span>SARVAM SAARAS ASR</span>
                <span className="font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]">180ms Latency</span>
              </div>
              <p className="text-[11px] text-[#374B3E] dark:text-slate-300">{current.pipeline.asr}</p>

              <div className="border-t border-[#0F3D2E]/8 dark:border-white/10 pt-2 flex items-center justify-between text-[#4F6355] dark:text-emerald-100/70">
                <span>CONTEXT FUSION</span>
                <span className="font-semibold text-[#22C55E] dark:text-[#a3e635]">Active Telemetry</span>
              </div>
              <p className="text-[11px] text-[#374B3E] dark:text-slate-300">{current.pipeline.context}</p>

              <div className="border-t border-[#0F3D2E]/8 dark:border-white/10 pt-2 flex items-center justify-between text-[#4F6355] dark:text-emerald-100/70">
                <span>GEMINI 3.5 FLASH LITE DIAGNOSTIC</span>
                <span className="font-semibold text-[#C2703F] dark:text-[#f97316]">Confidence 94%</span>
              </div>
              <p className="text-[11px] text-[#374B3E] dark:text-slate-300">{current.pipeline.diagnosis}</p>
            </div>

            {/* Spoken Advisory Bubble */}
            <div className="rounded-3xl border border-[#22C55E]/30 dark:border-emerald-500/30 bg-[#E9FFEC]/80 dark:bg-[#092e1e]/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#0F3D2E] dark:text-[#a3e635]">
                <Volume2 className="h-4 w-4 text-[#22C55E] dark:text-[#a3e635]" />
                <span>VOICE ADVISORY (SARVAM BULBUL TTS)</span>
              </div>
              <p className="mt-2 font-sans text-sm font-semibold text-[#0F3D2E] dark:text-emerald-100 leading-relaxed">
                "{current.pipeline.actionAudio}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
