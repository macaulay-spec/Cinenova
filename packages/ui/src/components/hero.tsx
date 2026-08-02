import { Info, Play, Plus } from 'lucide-react';
import type { TitleDetail } from '@cinenova/contracts';
import { AnchorButton } from './button';
import { RatingStars } from './rating-stars';

interface HeroProps {
  title: TitleDetail;
  eyebrow?: string;
}

/**
 * Full-bleed hero: 62vh mobile / 78vh desktop key art, scrim, content bottom-left.
 * Order: amber eyebrow -> uppercase title -> tagline -> metadata row + rating chip -> actions.
 */
export function Hero({ title, eyebrow = 'CineNova Original' }: HeroProps) {
  const heroArt = title.artwork.find((artwork) => artwork.kind === 'hero' || artwork.kind === 'landscape') ?? title.artwork[0];
  const rating = title.releaseYear || undefined;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative min-h-[420px] h-[62vh] sm:h-[78vh]">
        {heroArt?.url ? (
          <img
            src={heroArt.url}
            alt={`${title.title} key art`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden="true" />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-5">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="font-display text-4xl text-foreground sm:text-6xl lg:text-[4.5rem]">
            {title.title}
          </h1>
          {title.synopsis ? (
            <p className="max-w-2xl text-sm leading-6 text-foreground/80 sm:text-base">{title.synopsis}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {rating ? <span>{rating}</span> : null}
            <span aria-hidden="true">·</span>
            <span>{title.genres.slice(0, 3).join(' · ') || 'Film'}</span>
            <span aria-hidden="true">·</span>
            <span className="rounded-sm px-1.5 py-0.5 ring-1 ring-inset ring-border">
              {title.maturityRating.replace('_', '-')}
            </span>
            <RatingStars value={title.releaseYear} className="sr-only" />
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <AnchorButton href={`/watch/${title.id}`} variant="primary">
              <Play aria-hidden="true" className="mr-2 h-4 w-4 fill-current" /> Play
            </AnchorButton>
            <AnchorButton href="/my-list" variant="secondary">
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" /> My List
            </AnchorButton>
            <AnchorButton href={`/title/${title.slug}`} variant="ghost">
              <Info aria-hidden="true" className="mr-2 h-4 w-4" /> More Info
            </AnchorButton>
          </div>
        </div>
      </div>
    </section>
  );
}
