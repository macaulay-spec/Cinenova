import { AppShell, ContentRail, HeroBanner } from '@cinenova/ui';
import { getCatalogProvider } from '../lib/providers';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const home = await getCatalogProvider().homepage('NG');

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
