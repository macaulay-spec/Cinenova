import type { CatalogueRail } from '@cinenova/contracts';
import { PosterCard } from './poster-card';

interface ContentRailProps {
  rail: CatalogueRail;
}

export function ContentRail({ rail }: ContentRailProps) {
  if (rail.items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby={`${rail.id}-heading`}>
      <div className="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div>
          <h2 id={`${rail.id}-heading`} className="text-xl font-black text-cinenova-ivory sm:text-2xl">
            {rail.title}
          </h2>
          {rail.subtitle ? <p className="mt-1 text-sm text-cinenova-muted">{rail.subtitle}</p> : null}
        </div>
      </div>
      <div className="scrollbar-none flex gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-10">
        {rail.items.map((title) => (
          <PosterCard key={title.id} title={title} href={`/title/${title.slug}`} />
        ))}
      </div>
    </section>
  );
}
