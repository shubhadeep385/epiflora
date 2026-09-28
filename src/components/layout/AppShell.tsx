import { NavLink, Outlet, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { NAV_ITEMS, PRIMARY_NAV } from '../../lib/nav.ts';
import { LogoMark, Wordmark } from '../ui/Logo.tsx';
import { StatusPill } from '../ui/StatusPill.tsx';
import { ThemeToggle } from '../ui/ThemeToggle.tsx';
import { useAppStore } from '../../store/appStore.ts';

/**
 * Mobile-first shell: bottom bar under the thumb on phones, sidebar on desktop.
 * The primary user is a farmer holding a phone in a field, so the five most
 * useful destinations stay one tap away at all times.
 */
export function AppShell() {
  const location = useAppStore((state) => state.location);
  const displayLocation = location?.label || 'Pune, India';

  return (
    <div className="min-h-dvh bg-[#FAF8F3] dark:bg-[#07130e] text-[#0F3D2E] dark:text-[#FAF8F3] transition-colors duration-300">
      <header className="sticky top-0 z-30 border-b border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3]/85 dark:bg-[#07130e]/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#0F3D2E] dark:text-[#FAF8F3]"
            aria-label="EpiFlora home"
          >
            <LogoMark className="size-8" />
            <Wordmark className="text-lg text-[#0F3D2E] dark:text-[#FAF8F3]" />
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {/* Dynamic Active Farm Location indicator */}
            <Link
              to="/profile"
              title={`Active Farm Location: ${displayLocation} (Click to change)`}
              className="hidden items-center gap-1.5 text-xs sm:text-sm font-medium text-[#4F6355] hover:text-[#0F3D2E] dark:text-emerald-100/70 dark:hover:text-white transition-colors md:inline-flex max-w-[240px] truncate group"
            >
              <MapPin className="size-3.5 shrink-0 text-[#22C55E] dark:text-[#2AD58B] group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="truncate">{displayLocation}</span>
            </Link>

            {/* Global Theme Toggle */}
            <ThemeToggle showLabel={false} />

            <StatusPill />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6">
        {/* Desktop sidebar */}
        <nav aria-label="Main" className="hidden w-60 shrink-0 py-8 lg:block">
          <ul className="sticky top-24 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    [
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors',
                      isActive
                        ? 'bg-white dark:bg-[#0E241B] font-semibold text-[#0F3D2E] dark:text-[#2AD58B] shadow-sm border border-[#0F3D2E]/10 dark:border-emerald-500/20'
                        : 'text-[#5C6B64] dark:text-emerald-100/70 hover:bg-white/60 dark:hover:bg-[#132C22] hover:text-[#0F3D2E] dark:hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* pb-24 clears the mobile bottom bar */}
        <main id="main" className="min-w-0 flex-1 py-6 pb-24 sm:py-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#0F3D2E]/10 dark:border-white/10 bg-[#FAF8F3]/95 dark:bg-[#07130e]/95 backdrop-blur-md lg:hidden transition-colors"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto flex max-w-lg">
          {PRIMARY_NAV.map(({ to, shortLabel, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                    isActive
                      ? 'font-semibold text-[#0F3D2E] dark:text-[#2AD58B]'
                      : 'text-[#5C6B64] dark:text-emerald-100/70',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={isActive ? 'size-5' : 'size-5 opacity-70'}
                      aria-hidden="true"
                    />
                    {shortLabel}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
