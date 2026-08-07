import { Avatar, Wordmark } from '@cinenova/ui';
import { Lock, Plus } from 'lucide-react';
import { getPrincipalDto } from '../../lib/local-principal';

export const dynamic = 'force-dynamic';

const TINTS = ['#4a4038', '#3d4855', '#4a3838', '#3f4a3a'];

/** Profile gate — no shell, no nav. Centred column, max 2xl. */
export default async function ProfilesPage() {
  const principal = await getPrincipalDto();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-10 text-center">
        <div className="flex justify-center">
          <Wordmark className="text-2xl" />
        </div>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">Who&apos;s watching?</h1>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {principal.profiles.map((profile, index) => (
            <a
              key={profile.id}
              href="/"
              className="group flex flex-col items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              aria-label={`Continue as ${profile.name}`}
            >
              <Avatar
                initial={profile.avatarInitial}
                size="lg"
                {...(TINTS[index % TINTS.length] ? { tint: TINTS[index % TINTS.length] } : {})}
                className="transition group-hover:opacity-60"
              />
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                {profile.name}
                {profile.pinProtected ? (
                  <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                ) : null}
                {profile.type === 'child' ? (
                  <span className="rounded-sm border border-border px-1 text-[0.625rem] font-bold text-muted">
                    KIDS
                  </span>
                ) : null}
              </span>
            </a>
          ))}

          {/* Add Profile tile */}
          <a
            href="/account"
            className="flex flex-col items-center gap-3 rounded-md border-2 border-dashed border-border p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Add profile"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-secondary text-muted sm:h-24 sm:w-24">
              <Plus aria-hidden="true" className="h-7 w-7" />
            </span>
            <span className="text-sm text-muted">Add Profile</span>
          </a>
        </div>

        <p className="mx-auto max-w-md text-xs leading-5 text-muted">
          Kid profiles hide titles above their rating and may require a PIN before playback. Profiles
          are switchable anytime and remember their own preferences.
        </p>
      </div>
    </main>
  );
}
