import { useThemeStore } from '../../store/themeStore.ts';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`inline-flex items-center justify-center rounded-full p-2.5 sm:p-2 text-xs font-semibold transition-all duration-200 cursor-pointer select-none border hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-[#0E241B] hover:bg-[#15382a] border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-950/40'
          : 'bg-[#FCF9F0] hover:bg-white border-[#0F3D2E]/20 text-[#0F3D2E] shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to Warm Light Theme' : 'Switch to Deep Forest Dark Theme'}
      title={isDark ? 'Switch to Warm Light Theme' : 'Switch to Deep Forest Dark Theme'}
    >
      <div className="flex h-4 w-4 items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 text-[#facc15] transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-[#0F3D2E] transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="ml-1.5 font-mono text-[11px] tracking-wider uppercase font-bold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
