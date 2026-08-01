import { AppShell, Badge } from '@cinenova/ui';

export default function ProfilesPage() {
  return (
    <AppShell active="account">
      <section className="grid min-h-screen place-items-center px-4 py-28 sm:px-6 lg:px-10">
        <div className="w-full max-w-4xl text-center">
          <Badge>Profiles</Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">Who is watching?</h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {['Adult', 'Kids', 'Guest'].map((profile) => (
              <a
                key={profile}
                href="/"
                className="rounded-[2rem] border border-white/10 bg-white/6 p-8 transition hover:border-cinenova-accent/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
              >
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-cinenova-accent to-[#642116] text-3xl font-black text-white">
                  {profile[0]}
                </div>
                <p className="mt-5 text-lg font-black text-white">{profile}</p>
                <p className="mt-1 text-sm text-cinenova-muted">
                  {profile === 'Kids' ? 'Maturity ceiling and PIN-ready' : 'Personalized recommendations'}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
