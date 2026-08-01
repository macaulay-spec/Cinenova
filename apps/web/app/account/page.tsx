import { AppShell, Badge } from '@cinenova/ui';

const settings = [
  'Email/passwordless sign-in adapter boundary',
  'HttpOnly Secure SameSite session cookies',
  'Device management and stream limits',
  'Notification preferences and quiet hours',
  'Privacy export/delete request workflow',
  'Language, captions, audio, and theme preferences',
];

export default function AccountPage() {
  return (
    <AppShell active="account">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="space-y-4">
            <Badge>Account foundation</Badge>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Account</h1>
            <p className="max-w-3xl text-cinenova-muted">
              This screen outlines the secure account surface to implement after domain and catalogue
              foundations are stable.
            </p>
          </div>
          <div className="grid gap-3">
            {settings.map((setting) => (
              <div key={setting} className="rounded-3xl border border-white/10 bg-white/6 p-5 text-cinenova-muted">
                {setting}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
