import { AppShell, ContentRail } from '@cinenova/ui';
import { Trash2 } from 'lucide-react';
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

  const library = home?.rails[0]?.items?.slice(0, 6) ?? [];
  const continueWatching = home?.rails[1]?.items?.slice(0, 6) ?? [];

  return (
    <AppShell active="my-list">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">My List</h1>

          {providerError || library.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-10 text-center">
              <p className="font-display text-xl text-foreground">Nothing saved yet</p>
              <p className="mt-2 text-sm text-muted">Browse the catalogue and build your list.</p>
              <a href="/" className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-80">
                Browse titles
              </a>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border rounded-md border border-border bg-surface">
                {library.map((title) => (
                  <div key={title.id} className="flex items-center gap-4 p-3">
                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded-sm bg-secondary">
                      {title.artwork[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={title.artwork[0].url} alt={`${title.title} poster artwork`} className="h-full w-full object-cover" loading="lazy" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href={`/title/${title.slug}`} className="truncate text-sm font-bold text-foreground hover:text-primary">
                        {title.title}
                      </a>
                      <p className="text-xs text-muted">
                        {title.runtimeSeconds ? `${Math.round(title.runtimeSeconds / 60)} min` : '—'} · {title.releaseYear}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${title.title} from My List`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {continueWatching.length > 0 ? (
                <div className="pt-4">
                  <ContentRail id="cw" title="Continue Watching" items={continueWatching} variant="stills" progress={50} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}
