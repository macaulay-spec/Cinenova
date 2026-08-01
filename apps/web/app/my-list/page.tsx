import { AppShell, Badge } from '@cinenova/ui';

export default function MyListPage() {
  return (
    <AppShell active="home">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Badge>Library</Badge>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">My List</h1>
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 text-cinenova-muted">
            Saved titles will be stored per profile after identity/session persistence is connected.
          </div>
        </div>
      </section>
    </AppShell>
  );
}
