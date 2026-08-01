import { AppShell, Badge } from '@cinenova/ui';
import { getCatalogProvider } from '../../lib/providers';

export const dynamic = 'force-dynamic';

const modules = [
  'Catalogue titles, seasons, episodes, artwork, trailers',
  'Rights windows, territories, plans, streams, and downloads',
  'Editorial rails, drafts, scheduling, rollback',
  'Provider health, circuit breakers, and feature flags',
  'Users, devices, support tools, and immutable audit logs',
  'Analytics, SLO dashboards, runbooks, and incident links',
];

export default async function AdminPage() {
  const health = await getCatalogProvider().healthCheck();

  return (
    <AppShell active="admin">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4">
            <Badge>Admin RBAC surface</Badge>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Operations Console</h1>
            <p className="max-w-3xl text-cinenova-muted">
              Admin features are server-enforced and audited. This milestone provides the IA and
              provider health contract while deeper mutations remain behind RBAC implementation.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cinenova-accent">Provider health</p>
            <h2 className="mt-2 text-2xl font-black text-white">{health.provider}</h2>
            <p className="mt-2 text-cinenova-muted">{health.status} · {health.message}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((module) => (
              <div key={module} className="rounded-3xl border border-white/10 bg-white/6 p-5 text-cinenova-muted">
                {module}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
