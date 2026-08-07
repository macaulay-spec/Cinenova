'use client';

import { AppShell } from '@cinenova/ui';
import { Trash2 } from 'lucide-react';
import { useMyList } from '../../lib/use-my-list';

export default function MyListPage() {
  const { items, loaded, remove } = useMyList();

  return (
    <AppShell active="my-list">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">My List</h1>

          {!loaded ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-surface" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-10 text-center">
              <p className="font-display text-xl text-foreground">Nothing saved yet</p>
              <p className="mt-2 text-sm text-muted">Browse the catalogue and build your list.</p>
              <a href="/" className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-80">
                Browse titles
              </a>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border border-border bg-surface">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3">
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-sm bg-secondary">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.posterUrl} alt={`${item.title} poster artwork`} className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <a href={`/title/${item.slug}`} className="truncate text-sm font-bold text-foreground hover:text-primary">
                      {item.title}
                    </a>
                    <p className="text-xs text-muted">
                      {item.kind === 'series' ? 'Series' : 'Movie'}
                      {item.year ? ` · ${item.year}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title} from My List`}
                    onClick={() => remove(item.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
