import { useHealth, activeProvider } from '../../hooks/useHealth.ts';

/**
 * Small, non-intrusive provider indicator.
 */
export function StatusPill() {
  const { health, loading, offline } = useHealth();

  if (loading) {
    return (
      <span className="hidden items-center gap-2 text-xs text-[#5C6B64] dark:text-emerald-100/60 sm:inline-flex">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        Checking services
      </span>
    );
  }

  if (offline) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 border border-amber-300/40 dark:border-amber-700/40">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Offline — saved data available
      </span>
    );
  }

  const intelligence = activeProvider(health?.intelligence);
  const voice = activeProvider(health?.speech);
  const demo = health?.demoMode || intelligence?.id === 'demo';

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-[#E9FFEC] dark:bg-[#0E241B] px-3 py-1 text-xs font-medium text-[#0F3D2E] dark:text-emerald-300 border border-[#0F3D2E]/10 dark:border-emerald-500/25"
      title={
        demo
          ? 'Seeded demo responses — no live AI calls'
          : `Intelligence: ${intelligence?.label ?? 'unavailable'} · Voice: ${voice?.label ?? 'browser'}`
      }
    >
      <span
        className={`size-1.5 rounded-full ${demo ? 'bg-amber-500' : 'bg-emerald-500 dark:bg-[#a3e635]'}`}
        aria-hidden="true"
      />
      <span className="sr-only">Active intelligence provider: </span>
      {demo ? 'Demo mode' : (intelligence?.label ?? 'AI unavailable')}
    </span>
  );
}
