import { AppShell, Badge } from '@cinenova/ui';
import { getPrincipalDto } from '../../lib/local-principal';

export const dynamic = 'force-dynamic';

const settings = [
  'Email/passwordless sign-in adapter boundary',
  'HttpOnly Secure SameSite session cookies',
  'Device management and stream limits',
  'Notification preferences and quiet hours',
  'Privacy export/delete request workflow',
  'Language, captions, audio, and theme preferences',
];

export default async function AccountPage() {
  const principal = await getPrincipalDto();

  return (
    <AppShell active="account">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4">
            <Badge>Account foundation</Badge>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Account</h1>
            <p className="max-w-3xl text-cinenova-muted">
              The account surface now reads from a server-resolved principal. This milestone keeps
              the demo identity local while matching the production contract for profiles, devices,
              roles, permissions, and entitlement snapshots.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
            <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6" aria-labelledby="identity-heading">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cinenova-accent">
                Signed-in principal
              </p>
              <h2 id="identity-heading" className="mt-2 text-2xl font-black text-white">
                {principal.user.displayName}
              </h2>
              <p className="mt-1 text-cinenova-muted">{principal.user.email}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-black/30 p-4">
                  <dt className="text-sm font-bold text-white">Active profile</dt>
                  <dd className="mt-1 text-cinenova-muted">
                    {principal.activeProfile.name} · {principal.activeProfile.maturityCeiling.replace('_', '-')}
                  </dd>
                </div>
                <div className="rounded-3xl bg-black/30 p-4">
                  <dt className="text-sm font-bold text-white">Plan</dt>
                  <dd className="mt-1 text-cinenova-muted">
                    {principal.entitlement.plan} · {principal.entitlement.concurrentStreamLimit} streams ·{' '}
                    {principal.entitlement.offlineDeviceLimit} offline device
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6" aria-labelledby="rbac-heading">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cinenova-accent">
                RBAC
              </p>
              <h2 id="rbac-heading" className="mt-2 text-2xl font-black text-white">
                Roles and permissions
              </h2>
              <p className="mt-2 text-sm text-cinenova-muted">Roles: {principal.user.roles.join(', ')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {principal.user.permissions.map((permission) => (
                  <span key={permission} className="rounded-full bg-black/35 px-3 py-1 text-xs text-cinenova-muted">
                    {permission}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <section aria-labelledby="devices-heading" className="space-y-4">
            <h2 id="devices-heading" className="text-2xl font-black text-white">
              Devices
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {principal.devices.map((device) => (
                <div key={device.id} className="rounded-3xl border border-white/10 bg-white/6 p-5">
                  <p className="font-bold text-white">{device.name}</p>
                  <p className="mt-1 text-sm text-cinenova-muted">
                    {device.trusted ? 'Trusted' : 'Untrusted'} ·{' '}
                    {device.offlineRegistered ? 'offline registered' : 'not offline registered'} · last seen{' '}
                    {new Date(device.lastSeenAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="settings-heading" className="space-y-4">
            <h2 id="settings-heading" className="text-2xl font-black text-white">
              Next account modules
            </h2>
            <div className="grid gap-3">
              {settings.map((setting) => (
                <div key={setting} className="rounded-3xl border border-white/10 bg-white/6 p-5 text-cinenova-muted">
                  {setting}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
