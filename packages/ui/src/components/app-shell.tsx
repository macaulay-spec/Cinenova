import type { ReactNode } from 'react';
import { Bell, Download, Home, Search, Shield, User } from 'lucide-react';
import { cn } from '../cn';

interface AppShellProps {
  children: ReactNode;
  active?: 'home' | 'search' | 'downloads' | 'account' | 'admin';
}

const navItems = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'search', label: 'Search', href: '/search', icon: Search },
  { key: 'downloads', label: 'Downloads', href: '/downloads', icon: Download },
  { key: 'account', label: 'Account', href: '/account', icon: User },
  { key: 'admin', label: 'Admin', href: '/admin', icon: Shield },
] as const;

export function AppShell({ children, active = 'home' }: AppShellProps) {
  return (
    <div className="min-h-screen bg-cinenova-void text-cinenova-ivory">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cinenova-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-cinenova-void/82 backdrop-blur-xl">
        <nav className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10" aria-label="Primary navigation">
          <a href="/" className="flex items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cinenova-accent font-black text-white shadow-glow">
              C
            </span>
            <span className="text-lg font-black tracking-tight text-white">CineNova</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-bold text-cinenova-muted transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent',
                  active === item.key && 'bg-white/10 text-white',
                )}
                aria-current={active === item.key ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/8 text-cinenova-muted transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
              aria-label="Open notifications"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
            </button>
            <a
              href="/profiles"
              className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-cinenova-accent to-[#642116] text-sm font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
              aria-label="Switch profile"
            >
              A
            </a>
          </div>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[1.75rem] border border-white/10 bg-cinenova-panel/95 p-2 shadow-card backdrop-blur md:hidden" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-bold text-cinenova-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent',
                active === item.key && 'bg-cinenova-accent text-white',
              )}
              aria-current={active === item.key ? 'page' : undefined}
            >
              {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : <span className="h-4 w-4" aria-hidden="true" />}
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
