import { notFound } from 'next/navigation';
import { AppShell, AnchorButton, Badge, ContentRail, TitleMetadata } from '@cinenova/ui';
import { Download, Play, Plus } from 'lucide-react';
import { getCatalogProvider } from '../../../lib/providers';

interface TitlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const provider = getCatalogProvider();
  const title = await provider.titleBySlug(slug, 'NG');

  if (!title) {
    notFound();
  }

  const recommendations = await provider.recommendations(title.id, 'NG');
  const hero = title.artwork.find((artwork) => artwork.kind === 'hero') ?? title.artwork[0];

  return (
    <AppShell active="home">
      <section className="relative isolate overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-10 lg:pt-36">
        <div
          className="absolute inset-0 -z-20"
          style={{
            background: `radial-gradient(circle at 75% 5%, ${hero?.dominantColor ?? '#e46b4a'}, transparent 34rem), linear-gradient(90deg,#05070b,#10131a 55%,#05070b)`,
          }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,7,11,0.18),#05070b_92%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-2">
              <Badge>{title.kind}</Badge>
              <Badge>{title.minimumPlan} plan</Badge>
              {title.offlineDownloadAllowed ? <Badge>Offline allowed</Badge> : null}
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">{title.title}</h1>
              <p className="max-w-3xl text-lg leading-8 text-cinenova-muted">{title.synopsis}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AnchorButton href={`/watch/${title.id}`}>
                <Play aria-hidden="true" className="mr-2 h-4 w-4 fill-current" /> Watch
              </AnchorButton>
              <AnchorButton href="/my-list" variant="secondary">
                <Plus aria-hidden="true" className="mr-2 h-4 w-4" /> My List
              </AnchorButton>
              <AnchorButton href="/downloads" variant="ghost">
                <Download aria-hidden="true" className="mr-2 h-4 w-4" /> Download state
              </AnchorButton>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-cinenova-panel/80 p-5 shadow-card backdrop-blur">
            <h2 className="text-lg font-black text-white">Rights status</h2>
            <p className="mt-2 text-sm leading-6 text-cinenova-muted">{title.rightsExplanation}</p>
            <p className="mt-4 rounded-2xl bg-black/35 p-4 text-xs leading-5 text-cinenova-muted">
              CineNova never serves this page as proof of entitlement. Playback/download APIs still
              evaluate active rights, profile maturity, territory, plan, asset, and device policy.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <TitleMetadata title={title} />
      </section>
      {title.seasons.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10" aria-labelledby="episodes-heading">
          <h2 id="episodes-heading" className="text-2xl font-black text-white">Episodes</h2>
          <div className="mt-5 grid gap-4">
            {title.seasons.flatMap((season) =>
              season.episodes.map((episode) => (
                <a
                  key={episode.id}
                  href={`/watch/${title.id}?assetId=${episode.assetId}`}
                  className="rounded-3xl border border-white/10 bg-white/6 p-5 transition hover:border-cinenova-accent/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-cinenova-accent">
                    S{episode.seasonNumber}:E{episode.episodeNumber}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-white">{episode.title}</h3>
                  <p className="mt-1 text-sm text-cinenova-muted">{episode.synopsis}</p>
                </a>
              )),
            )}
          </div>
        </section>
      ) : null}
      <div className="pb-28 pt-6">
        <ContentRail
          rail={{
            id: 'recommendations',
            title: 'Because you opened this title',
            subtitle: 'Rules-based recommendations for the first milestone',
            items: recommendations.map((item) => ({
              id: item.id,
              slug: item.slug,
              kind: item.kind,
              title: item.title,
              synopsis: item.synopsis,
              releaseYear: item.releaseYear,
              runtimeSeconds: item.runtimeSeconds,
              maturityRating: item.maturityRating,
              genres: item.genres,
              countries: item.countries,
              artwork: item.artwork,
              availableFrom: item.availableFrom,
              availableUntil: item.availableUntil,
              minimumPlan: item.minimumPlan,
              offlineDownloadAllowed: item.offlineDownloadAllowed,
              reasonLabel: item.reasonLabel,
            })),
          }}
        />
      </div>
    </AppShell>
  );
}
