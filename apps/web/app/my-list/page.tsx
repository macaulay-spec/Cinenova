import { AppShell, Badge, ContentRail, PosterCard } from '@cinenova/ui';
import { BookmarkPlus } from 'lucide-react';
import { getCatalogProvider } from '../../lib/providers';

export const dynamic = 'force-dynamic';

export default async function MyListPage() {
  const provider = getCatalogProvider();

  let home: Awaited<ReturnType<typeof provider.homepage>> | null = null;
  let providerError = false;
  try {
    home = await provider.homepage('NG');
  } catch {
    providerError = true;
  }

  const library = home?.rails[0]?.items ?? [];
  const recommendations = home?.rails[1]?.items ?? [];

  return (
    <AppShell active="home">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="space-y-4">
            <Badge>Library</Badge>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">My List</h1>
            <p className="max-w-3xl text-cinenova-muted">
              Your saved titles, populated from the live catalogue. Save/persistence is wired per
              profile once identity persistence is enabled.
            </p>
          </div>

          {providerError || !home ? (
            <div className="rounded-[2rem] border border-amber/30 bg-amber/10 p-10 text-center">
              <h2 className="text-2xl font-black text-white">Your list is warming up</h2>
              <p className="mt-2 text-cinenova-muted">
                The catalogue did not respond. Please refresh shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 text-cinenova-muted">
                <BookmarkPlus aria-hidden="true" className="h-5 w-5 text-cinenova-accent" />
                <p className="text-sm">
                  {library.length} title{library.length === 1 ? '' : 's'} in your list
                </p>
              </div>

              {library.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {library.map((title) => (
                    <PosterCard key={title.id} title={title} href={`/title/${title.slug}`} className="min-w-0" />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-white/6 p-10 text-center text-cinenova-muted">
                  Nothing saved yet. Browse the catalogue to build your list.
                </div>
              )}

              {recommendations.length > 0 ? (
                <ContentRail
                  rail={{
                    id: 'picks',
                    title: 'Because you watch on CineNova',
                    subtitle: 'Picks from the live catalogue',
                    items: recommendations,
                  }}
                />
              ) : null}
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}
