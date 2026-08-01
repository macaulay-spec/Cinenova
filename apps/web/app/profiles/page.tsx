import { AppShell, Badge } from '@cinenova/ui';
import { Lock, ShieldCheck } from 'lucide-react';
import { getPrincipalDto } from '../../lib/local-principal';

export const dynamic = 'force-dynamic';

export default async function ProfilesPage() {
  const principal = await getPrincipalDto();

  return (
    <AppShell active="account">
      <section className="grid min-h-screen place-items-center px-4 py-28 sm:px-6 lg:px-10">
        <div className="w-full max-w-5xl text-center">
          <Badge>Profiles</Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Who is watching?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-cinenova-muted">
            Profile switching now writes a secure, HttpOnly active-profile cookie. Playback and
            download requests use the active profile for maturity and entitlement policy checks.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {principal.profiles.map((profile) => (
              <form key={profile.id} action="/api/v1/profiles/active" method="post">
                <input type="hidden" name="profileId" value={profile.id} />
                <input type="hidden" name="returnTo" value="/" />
                <button
                  type="submit"
                  className="h-full w-full rounded-[2rem] border border-white/10 bg-white/6 p-8 text-left transition hover:border-cinenova-accent/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
                  aria-label={`Switch to ${profile.name} profile`}
                >
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-cinenova-accent to-[#642116] text-3xl font-black text-white">
                    {profile.avatarInitial}
                  </div>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <p className="text-lg font-black text-white">{profile.name}</p>
                    {profile.pinProtected ? <Lock aria-hidden="true" className="h-4 w-4 text-cinenova-muted" /> : null}
                    {profile.active ? <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-300" /> : null}
                  </div>
                  <p className="mt-2 text-center text-sm text-cinenova-muted">
                    {profile.type} · up to {profile.maturityCeiling.replace('_', '-')} ·{' '}
                    {profile.autoplay ? 'autoplay on' : 'autoplay off'}
                  </p>
                  <p className="mt-4 rounded-2xl bg-black/30 p-3 text-center text-xs text-cinenova-muted">
                    {profile.active ? 'Active profile' : 'Switch profile'}
                  </p>
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
