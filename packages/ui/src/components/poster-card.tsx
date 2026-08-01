import type { TitleSummary } from '@cinenova/contracts';
import { cn } from '../cn';

interface PosterCardProps {
  title: TitleSummary;
  href: string;
  priority?: boolean;
  className?: string;
}

export function PosterCard({ title, href, className }: PosterCardProps) {
  const poster = title.artwork.find((artwork) => artwork.kind === 'poster') ?? title.artwork[0];

  return (
    <a
      href={href}
      className={cn(
        'group block min-w-[10.5rem] max-w-[12rem] rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cinenova-accent focus-visible:ring-offset-4 focus-visible:ring-offset-cinenova-void sm:min-w-[12rem]',
        className,
      )}
      aria-label={`Open details for ${title.title}`}
    >
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-3xl border border-white/10 bg-cinenova-panel shadow-card transition duration-200 group-hover:-translate-y-1 group-hover:border-cinenova-accent/60"
        style={{
          background: `linear-gradient(145deg, ${poster?.dominantColor ?? '#e46b4a'}, #11141b 58%, #05070b)`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.28),transparent_55%)]" />
        <div className="absolute inset-x-4 bottom-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            {title.kind}
          </p>
          <h3 className="line-clamp-3 text-lg font-black leading-tight text-white">{title.title}</h3>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="line-clamp-1 text-sm font-bold text-cinenova-ivory">{title.title}</p>
        <p className="text-xs text-cinenova-muted">
          {title.releaseYear} · {title.maturityRating.replace('_', '-')} · {title.minimumPlan}
        </p>
      </div>
    </a>
  );
}
