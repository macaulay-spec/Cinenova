import { AppShell, Badge } from '@cinenova/ui';
import { Download, ShieldAlert, Smartphone } from 'lucide-react';

const states = [
  {
    icon: Download,
    title: 'Authorized download',
    body: 'Created only after rights, entitlement, territory, profile, device, quota, and expiry checks pass.',
  },
  {
    icon: ShieldAlert,
    title: 'Default deny',
    body: 'When no legally compliant transport exists, the UI explains that offline download is unavailable.',
  },
  {
    icon: Smartphone,
    title: 'Device-bound',
    body: 'Future native/PWA download records bind to trusted devices and expire when rights or plan state changes.',
  },
];

export default function DownloadsPage() {
  return (
    <AppShell active="downloads">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4">
            <Badge>Rights-gated architecture</Badge>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Downloads</h1>
            <p className="max-w-3xl text-cinenova-muted">
              Offline video is not claimed unless rights and delivery allow it. This milestone exposes
              the user states and API contract without bypassing provider restrictions.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {states.map((state) => {
              const Icon = state.icon;
              return (
                <article key={state.title} className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                  <Icon aria-hidden="true" className="h-7 w-7 text-cinenova-accent" />
                  <h2 className="mt-5 text-xl font-black text-white">{state.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-cinenova-muted">{state.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
