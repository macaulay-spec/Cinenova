import { AppShell, ContentRail, Hero } from '@cinenova/ui';
import { getCatalogProvider } from '../lib/providers';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let home: Awaited<ReturnType<ReturnType<typeof getCatalogProvider>['homepage']>> | null = null;
  let providerError = false;

  try {
    home = await getCatalogProvider().homepage('NG');
  } catch {
    providerError = true;
  }

  if (providerError || !home) {
    return (
      <AppShell active="home">
        <section className="flex min-h-screen items-center justify-center px-4 pt-20">
          <div className="max-w-xl rounded-md border border-border bg-surface p-10 text-center">
            <p className="eyebrow">Catalogue</p>
            <h1 className="mt-3 font-display text-2xl text-foreground">Warming up</h1>
            <p className="mt-3 text-sm text-muted">
              The catalogue could not be reached. Please refresh shortly. No provider keys or internal
              details are exposed.
            </p>
          </div>
        </section>
      </AppShell>
    );
  }

  const featured = home.hero;
  const firstRail = home.rails[0]?.items ?? [];

  return (
    <AppShell active="home" overlay>
      <Hero title={featured} />
      <div className="pb-20 pt-6">
        {/* Continue Watching — 16:9 stills, rail 1 */}
        <ContentRail
          id="continue"
          title="Continue Watching"
          items={firstRail.slice(0, 6)}
          variant="stills"
          progress={38}
        />
        {/* Curated 2:3 poster rails */}
        {home.rails.map((rail) => (
          <ContentRail
            key={rail.id}
            id={rail.id}
            title={rail.title}
            {...(rail.subtitle ? { subtitle: rail.subtitle } : {})}
            items={rail.items}
          />
        ))}
      </div>
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted sm:px-6 lg:px-8">
        All titles are licensed. Playback, downloads, and territories are governed by rights windows.
      </footer>
    </AppShell>
  );
}
