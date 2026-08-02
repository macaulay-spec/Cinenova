import { AppShell, PosterCard } from '@cinenova/ui';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getCatalogProvider } from '../../lib/providers';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
    kind?: 'movie' | 'series';
  }>;
}

const KIND_FILTERS: { id: '' | 'movie' | 'series'; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'series', label: 'Series' },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const query = resolved.q ?? '';
  const kind = resolved.kind ?? '';
  const provider = getCatalogProvider();
  let search: Awaited<ReturnType<typeof provider.search>> | null = null;
  let providerError = false;

  try {
    search = await provider.search(query, 'NG', kind || undefined);
  } catch {
    providerError = true;
  }

  return (
    <AppShell active="search">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">Search</h1>
            <p className="text-sm text-muted">Find your next story across movies and series.</p>
          </div>

          {/* Search field */}
          <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
            <Search aria-hidden="true" className="h-5 w-5 text-muted" />
            <form action="/search" className="flex-1">
              <label htmlFor="q" className="sr-only">
                Search titles
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Search titles, genres, cast, or mood"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </form>
            {query ? (
              <a href="/search" aria-label="Clear search" className="text-muted hover:text-foreground">
                <X aria-hidden="true" className="h-5 w-5" />
              </a>
            ) : null}
          </div>

          {/* Filter strip */}
          <div className="scrollbar-none flex items-center gap-3 overflow-x-auto" role="group" aria-label="Filter results">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5 shrink-0 text-muted" />
            {KIND_FILTERS.map((filter) => {
              const active = kind === filter.id;
              const href = `/search?${query ? `q=${encodeURIComponent(query)}&` : ''}${filter.id ? `kind=${filter.id}` : ''}`;
              return (
                <a
                  key={filter.id || 'all'}
                  href={href}
                  aria-pressed={active}
                  className={
                    active
                      ? 'rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground'
                      : 'rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-muted hover:text-foreground'
                  }
                >
                  {filter.label}
                </a>
              );
            })}
            <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
          </div>

          {/* Result line */}
          {search && !providerError ? (
            <p className="text-xs text-muted">
              {query ? `Results for "${query}" · ${search.results.length} title${search.results.length === 1 ? '' : 's'}` : `Top results · ${search.results.length}`}
            </p>
          ) : null}

          {/* Results */}
          {providerError ? (
            <div className="rounded-md border border-border bg-surface p-8 text-center">
              <h2 className="font-display text-xl text-foreground">Search is unavailable</h2>
              <p className="mt-2 text-sm text-muted">The catalogue did not respond. Try again shortly.</p>
            </div>
          ) : search && search.results.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
              {search.results.map((title) => (
                <PosterCard key={title.id} title={title} href={`/title/${title.slug}`} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-border bg-surface p-10 text-center">
              <h2 className="font-display text-xl text-foreground">No titles match that search</h2>
              <p className="mt-2 text-sm text-muted">
                Try different spelling, browse by genre, or note that some titles may not be available
                in your territory.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
