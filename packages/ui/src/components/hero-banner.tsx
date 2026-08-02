import type { TitleDetail } from '@cinenova/contracts';
import { Play, Plus, ShieldCheck } from 'lucide-react';
import { AnchorButton } from './button';
import { Badge } from './badge';

interface HeroBannerProps {
  title: TitleDetail;
}

export function HeroBanner({ title }: HeroBannerProps) {
  const hero = title.artwork.find((artwork) => artwork.kind === 'hero') ?? title.artwork[0];

  return (
    <section
      className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-16 pt-28 sm:px-6 lg:px-10 lg:pb-24 lg:pt-36"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(circle at 75% 18%, ${hero?.dominantColor ?? '#e46b4a'} 0%, rgba(228,107,74,0.12) 35%, transparent 63%), linear-gradient(90deg,#05070b 0%,rgba(5,7,11,0.92) 42%,rgba(5,7,11,0.45) 100%)`,
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,7,11,0.15),#05070b_92%)]" />
      <div className="max-w-3xl space-y-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>CineNova</Badge>
          <Badge className="border-emerald-400/30 text-emerald-200">
            <ShieldCheck aria-hidden="true" className="mr-1 h-3.5 w-3.5" /> Rights-gated
          </Badge>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cinenova-accent">
            Featured on CineNova
          </p>
          <h1 id="hero-heading" className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
            {title.title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-cinenova-muted sm:text-lg">{title.synopsis}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-cinenova-muted">
          <span>{title.releaseYear}</span>
          <span aria-hidden="true">·</span>
          <span>{title.maturityRating.replace('_', '-')}</span>
          <span aria-hidden="true">·</span>
          <span>{title.genres.slice(0, 3).join(' / ')}</span>
          <span aria-hidden="true">·</span>
          <span>{title.minimumPlan} plan</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <AnchorButton href={`/watch/${title.id}`}>
            <Play aria-hidden="true" className="mr-2 h-4 w-4 fill-current" /> Watch securely
          </AnchorButton>
          <AnchorButton href={`/title/${title.slug}`} variant="secondary">
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" /> More details
          </AnchorButton>
        </div>
      </div>
    </section>
  );
}
