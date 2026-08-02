'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Download, MoreHorizontal, Play, Plus } from 'lucide-react';
import { AnchorButton, ContentRail, RatingStars, Tabs } from '@cinenova/ui';
import type { TitleDetail } from '@cinenova/contracts';

type SectionId = 'overview' | 'episodes' | 'more';

export function TitleDetailView({ title, recs }: { title: TitleDetail; recs: TitleDetail[] }) {
  const router = useRouter();
  const [section, setSection] = useState<SectionId>(title.kind === 'series' ? 'episodes' : 'overview');
  const [saved, setSaved] = useState(false);

  const heroArt = title.artwork.find((a) => a.kind === 'hero' || a.kind === 'landscape') ?? title.artwork[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Key art hero with scrim */}
      <section className="relative isolate h-[52vh] sm:h-[70vh]">
        {heroArt?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroArt.url} alt={`${title.title} key art`} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden="true" />
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="Back"
          className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-sm hover:bg-black/60 sm:left-6 sm:top-6"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="-mt-20 relative z-10 space-y-5">
          <h1 className="font-display text-3xl text-foreground sm:text-5xl">{title.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <RatingStars value={title.releaseYear} className="text-xs" />
            <span aria-hidden="true">·</span>
            <span>{title.releaseYear}</span>
            <span aria-hidden="true">·</span>
            <span>{title.runtimeSeconds ? `${Math.round(title.runtimeSeconds / 60)} min` : '—'}</span>
            <span aria-hidden="true">·</span>
            <span className="rounded-sm px-1.5 py-0.5 ring-1 ring-inset ring-border">
              {title.maturityRating.replace('_', '-')}
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-foreground/90 sm:text-base">{title.synopsis}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <AnchorButton href={`/watch/${title.id}`} variant="primary">
              <Play aria-hidden="true" className="mr-2 h-4 w-4 fill-current" /> Play
            </AnchorButton>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              className="inline-flex items-center rounded-md bg-white/5 px-5 py-2.5 text-sm font-bold text-foreground ring-1 ring-inset ring-border hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" /> {saved ? 'In My List' : 'My List'}
            </button>
            {title.offlineDownloadAllowed ? (
              <AnchorButton href="/downloads" variant="ghost">
                <Download aria-hidden="true" className="mr-2 h-4 w-4" /> Download
              </AnchorButton>
            ) : (
              <span
                className="inline-flex cursor-not-allowed items-center rounded-md bg-transparent px-5 py-2.5 text-sm font-bold text-muted ring-1 ring-inset ring-border opacity-60"
                title="Download not available for this title"
                aria-disabled="true"
              >
                <Download aria-hidden="true" className="mr-2 h-4 w-4" /> Download unavailable
              </span>
            )}
            <button
              type="button"
              aria-label="More actions"
              className="grid h-11 w-11 place-items-center rounded-md bg-transparent text-muted ring-1 ring-inset ring-border hover:text-foreground"
            >
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className="mt-10 pb-20">
          <Tabs
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'episodes', label: 'Episodes' },
              { id: 'more', label: 'More Like This' },
            ]}
            active={section}
            onSelect={(id) => setSection(id as SectionId)}
          />

          {section === 'overview' ? (
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {[
                ['Director', title.directors.join(', ') || '—'],
                ['Cast', title.cast.slice(0, 6).join(', ') || '—'],
                ['Audio', title.audioTracks.map((a) => a.language.toUpperCase()).join(', ') || 'English'],
                ['Subtitles', title.subtitleTracks.length ? `${title.subtitleTracks.length} tracks` : 'None'],
                ['Genres', title.genres.join(', ') || '—'],
                ['Availability', title.availableFrom.slice(0, 4)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {section === 'episodes' ? (
            <div className="mt-6 divide-y divide-border rounded-md border border-border bg-surface">
              {(title.seasons?.[0]?.episodes ?? []).slice(0, 8).map((ep, index) => (
                <div key={ep.id} className="flex items-center gap-4 p-3">
                  <div className="h-14 w-24 shrink-0 rounded-sm bg-secondary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {index + 1}. {ep.title}
                    </p>
                    <p className="truncate text-xs text-muted">{ep.synopsis}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {Math.round((ep.runtimeSeconds ?? 0) / 60)} min
                  </span>
                  <a
                    href={`/watch/${title.id}?assetId=${ep.assetId}`}
                    aria-label={`Play episode ${index + 1}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-border text-foreground hover:bg-white/10"
                  >
                    <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                  </a>
                </div>
              ))}
            </div>
          ) : null}

          {section === 'more' ? (
            <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
              {recs.map((r) => (
                <a key={r.id} href={`/title/${r.slug}`} className="block">
                  <div className="aspect-[2/3] rounded-md bg-surface ring-1 ring-inset ring-border" />
                  <p className="mt-2 truncate text-sm font-bold text-foreground">{r.title}</p>
                </a>
              ))}
            </div>
          ) : null}

          {section !== 'more' && recs.length > 0 ? (
            <div className="mt-10">
              <ContentRail id="more-like" title="More Like This" items={recs} />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
