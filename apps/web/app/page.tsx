import { AppShell, ContentRail, Hero, StateCard } from '@cinenova/ui';
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
          <StateCard
            kind="offline"
            title="Catalogue unavailable"
            description="We could not reach the catalogue. Refresh shortly. No provider keys or internal details are exposed."
          >
            <a href="/" className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-80">
              Retry
            </a>
          </StateCard>
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
