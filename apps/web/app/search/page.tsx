import { AppShell, Badge, PosterCard } from '@cinenova/ui';
import { Search } from 'lucide-react';
import { getCatalogProvider } from '../../lib/providers';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q ?? '';
  let search: Awaited<ReturnType<ReturnType<typeof getCatalogProvider>['search']>> | null = null;
  let providerError = false;

  try {
    search = await getCatalogProvider().search(query, 'NG');
  } catch {
    providerError = true;
  }

  return (
    <AppShell active="search">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4">
            <Badge>Discovery</Badge>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Search CineNova</h1>
            <p className="max-w-2xl text-cinenova-muted">
              Search runs against the live provider catalogue. Results are rights-filtered and
              cached briefly at the edge.
            </p>
          </div>
          <form action="/search" className="relative max-w-3xl">
            <Search aria-hidden="true" className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cinenova-muted" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search titles, genres, cast, or mood"
              className="min-h-14 w-full rounded-full border border-white/10 bg-white/8 pl-14 pr-5 text-base text-white outline-none transition placeholder:text-cinenova-muted focus:border-cinenova-accent focus:ring-2 focus:ring-cinenova-accent/40"
            />
          </form>
          {query && search ? (
            <p className="text-sm text-cinenova-muted">
              {search.results.length} result{search.results.length === 1 ? '' : 's'} for “{query}”
            </p>
          ) : null}
          {search && search.suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {search.suggestions.map((suggestion) => (
                <a
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-bold text-cinenova-muted hover:bg-white/12 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
                >
                  {suggestion}
                </a>
              ))}
            </div>
          ) : null}
          {providerError ? (
            <div className="rounded-[2rem] border border-amber/30 bg-amber/10 p-8 text-center">
              <h2 className="text-2xl font-black text-white">Search is temporarily unavailable</h2>
              <p className="mt-2 text-cinenova-muted">
                The catalogue service did not respond. Please try again shortly. No provider keys or
                internal details are exposed.
              </p>
            </div>
          ) : search && search.results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {search.results.map((title) => (
                <PosterCard key={title.id} title={title} href={`/title/${title.slug}`} className="min-w-0" />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 text-center">
              <h2 className="text-2xl font-black text-white">No results yet</h2>
              <p className="mt-2 text-cinenova-muted">
                Try another title, genre, or mood. Results come from the live provider catalogue.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
