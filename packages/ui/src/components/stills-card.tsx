import { Play } from 'lucide-react';
import type { TitleSummary } from '@cinenova/contracts';
import { cn } from '../cn';

interface StillsCardProps {
  title: TitleSummary;
  href: string;
  /** 0–100 progress; renders a 3px amber progress bar pinned to the bottom edge. */
  progress?: number;
  caption?: string;
  className?: string;
}

/**
 * 16:9 continue-watching still card with a centre circular play badge and a
 * 3px amber progress bar pinned to the card's bottom edge.
 */
export function StillsCard({ title, href, progress = 0, caption, className }: StillsCardProps) {
  const still = title.artwork.find((artwork) => artwork.kind === 'landscape' || artwork.kind === 'hero') ?? title.artwork[0];
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <a
      href={href}
      aria-label={`Continue watching ${title.title}`}
      className={cn('group block min-w-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary', className)}
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-surface ring-1 ring-inset ring-border">
        {still?.url ? (
          <img
            src={still.url}
            alt={`${title.title} still`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center">
            <span className="font-display text-sm uppercase leading-tight text-foreground">{title.title}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-poster" />
        {/* Centre circular translucent play badge */}
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-foreground ring-1 ring-white/20 backdrop-blur-sm">
          <Play aria-hidden="true" className="ml-0.5 h-5 w-5 fill-current" />
        </span>
        {/* 3px amber progress bar pinned to bottom edge */}
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-secondary" aria-hidden="true">
          <span className="block h-full bg-primary" style={{ width: `${pct}%` }} />
        </span>
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-bold text-foreground">{title.title}</p>
        {caption ? <p className="mt-0.5 text-[0.6875rem] text-muted">{caption}</p> : null}
      </div>
    </a>
  );
}
