import { AppShell, ContentRail, HeroBanner } from '@cinenova/ui';
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
        <section className="grid min-h-screen place-items-center px-4 py-28">
          <div className="max-w-xl rounded-[2rem] border border-amber/30 bg-amber/10 p-10 text-center">
            <h1 className="text-3xl font-black text-white">The catalogue is warming up</h1>
            <p className="mt-3 text-cinenova-muted">
              We could not reach the catalogue right now. Please refresh shortly. No internal details
              or provider keys are exposed.
            </p>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell active="home">
      <HeroBanner title={home.hero} />
      <div className="space-y-12 pb-28 pt-10">
        {home.rails.map((rail) => (
          <ContentRail key={rail.id} rail={rail} />
        ))}
      </div>
    </AppShell>
  );
}
