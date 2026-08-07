import type { ReactNode } from 'react';
import { Download, Home, List, Search, User } from 'lucide-react';
import { cn } from '../cn';
import { Wordmark } from './wordmark';

export type NavKey = 'home' | 'search' | 'my-list' | 'downloads' | 'profile';

interface AppShellProps {
  children: ReactNode;
  active?: NavKey | (string & {});
  /** Transparent header (over key art) for Home / Title detail. */
  overlay?: boolean;
}

const navItems: { key: NavKey; label: string; href: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'search', label: 'Search', href: '/search', icon: Search },
  { key: 'my-list', label: 'My List', href: '/my-list', icon: List },
  { key: 'downloads', label: 'Downloads', href: '/downloads', icon: Download },
  { key: 'profile', label: 'Profile', href: '/profiles', icon: User },
];

export function AppShell({ children, active = 'home', overlay = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop / tablet top bar (64px) */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 hidden min-h-16 items-center md:flex',
          overlay
            ? 'bg-gradient-to-b from-background/95 via-background/60 to-transparent'
            : 'border-b border-border bg-background/90 backdrop-blur-md',
        )}
      >
        <div className="flex w-full items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="rounded-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Wordmark />
          </a>
          <nav className="flex items-center gap-6" aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = active === item.key;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-sm text-sm font-bold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                    isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Search aria-hidden="true" className="h-5 w-5" />
            </a>
            <a
              href="/profiles"
              aria-label="Switch profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-display text-sm ring-1 ring-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              A
            </a>
          </div>
        </div>
      </header>

      {/* Mobile top wordmark */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 flex min-h-14 items-center px-4 md:hidden',
          overlay ? 'bg-gradient-to-b from-background/95 to-transparent' : 'bg-background/90 backdrop-blur-md',
        )}
      >
        <a
          href="/"
          className="rounded-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Wordmark />
        </a>
      </header>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Mobile bottom tab bar — five items */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex min-h-16 items-stretch justify-around border-t border-border bg-background/90 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <a
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-w-14 flex-col items-center justify-center gap-1 pb-2 pt-3 text-[0.625rem] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                isActive ? 'text-primary' : 'text-muted hover:text-foreground',
              )}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* TV / 10-foot left rail */}
      <nav
        className="fixed left-0 top-0 z-40 hidden min-h-screen w-40 flex-col gap-2 border-r border-border bg-background/95 px-3 py-6 [@media(min-width:1600px)_and_(pointer:coarse)]:flex"
        aria-label="TV navigation"
      >
        <div className="mb-6 px-2">
          <Wordmark />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <a
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-3 text-base font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              {isActive ? (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-primary" aria-hidden="true" />
              ) : null}
              <Icon aria-hidden="true" className="h-5 w-5" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
