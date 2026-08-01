import { AppShell, Badge } from '@cinenova/ui';
import { getPrincipalDto } from '../../lib/local-principal';
import { ProfileSwitcher } from '../../components/profile-switcher';

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
            Profile switching now runs behind a server-side session and CSRF boundary. Playback and
            download requests use the active profile for maturity and entitlement policy checks.
          </p>
          <ProfileSwitcher profiles={principal.profiles} />
        </div>
      </section>
    </AppShell>
  );
}
