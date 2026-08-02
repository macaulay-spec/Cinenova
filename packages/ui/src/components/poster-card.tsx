import type { TitleSummary } from '@cinenova/contracts';
import { cn } from '../cn';

interface PosterCardProps {
  title: TitleSummary;
  href: string;
  className?: string;
}

/**
 * 2:3 poster card. Signature motion: scale(1.04) over 500ms on hover.
 * Focus is an amber ring. Caption: year · kind.
 */
export function PosterCard({ title, href, className }: PosterCardProps) {
  const poster = title.artwork.find((artwork) => artwork.kind === 'poster') ?? title.artwork[0];

  return (
    <a
      href={href}
      aria-label={`Open ${title.title} poster artwork`}
      className={cn('group block min-w-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary', className)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-inset ring-border">
        {poster?.url ? (
          <img
            src={poster.url}
            alt={`${title.title} poster artwork`}
            loading="lazy"
            width={poster.width}
            height={poster.height}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-end p-3">
            <span className="font-display text-sm uppercase leading-tight text-foreground">{title.title}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-poster" />
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-bold text-foreground">{title.title}</p>
        <p className="mt-0.5 text-[0.6875rem] text-muted">
          {title.releaseYear} · {title.kind === 'series' ? 'Series' : 'Movie'}
        </p>
      </div>
    </a>
  );
}
