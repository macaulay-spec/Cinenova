import { ChevronRight } from 'lucide-react';
import type { TitleSummary } from '@cinenova/contracts';
import { PosterCard } from './poster-card';
import { StillsCard } from './stills-card';

interface ContentRailProps {
  id: string;
  title: string;
  subtitle?: string;
  items: TitleSummary[];
  /** Render as 16:9 continue-watching stills (rail 1). */
  variant?: 'poster' | 'stills';
  progress?: number;
}

/** Horizontal scrolling rail with hidden scrollbars and a chevron affordance. */
export function ContentRail({ id, title, subtitle, items, variant = 'poster', progress = 0 }: ContentRailProps) {
  return (
    <section className="mt-8" aria-labelledby={`rail-${id}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <h2 id={`rail-${id}`} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted" />
        </div>
        {subtitle ? <p className="hidden text-xs text-muted sm:block">{subtitle}</p> : null}
      </div>
      <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {items.map((item) =>
          variant === 'stills' ? (
            <StillsCard
              key={item.id}
              title={item}
              href={`/title/${item.slug}`}
              progress={progress}
              caption="Continue"
              className="w-56 sm:w-72"
            />
          ) : (
            <PosterCard
              key={item.id}
              title={item}
              href={`/title/${item.slug}`}
              className="w-28 sm:w-40"
            />
          ),
        )}
      </div>
    </section>
  );
}
