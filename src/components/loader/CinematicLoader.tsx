import { useEffect, useState } from 'react';
import { LogoMark } from '../ui/Logo.tsx';

interface CinematicLoaderProps {
  onComplete: () => void;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 8;
      });
    }, 30);

    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        onComplete();
      }, 350);
    }, 600);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07130E] px-6 text-white transition-opacity duration-350 ${
        isFading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-live="polite"
      aria-label="EpiFlora System Initialization"
    >
      {/* Ambient background glow */}
      <div className="absolute h-72 w-72 rounded-full bg-[#22C55E]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center">
        {/* Brand Icon */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <LogoMark className="h-7 w-7 text-[#2AD58B] animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif text-xl font-bold tracking-tight text-white">
          EPI<span className="font-light text-[#8C6A4D]">FLORA</span>
        </h1>
        <p className="mt-1 font-mono text-[10px] tracking-widest text-[#2AD58B]/80 uppercase">
          Autonomous Agricultural Intelligence
        </p>

        {/* Minimalist Glowing Progress Line */}
        <div className="mt-6 w-full">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#6EE7B7] shadow-[0_0_12px_rgba(42,213,139,0.8)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
