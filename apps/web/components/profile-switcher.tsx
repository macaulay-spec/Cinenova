'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import type { ProfileDto } from '@cinenova/contracts';

interface ProfileSwitcherProps {
  profiles: ProfileDto[];
}

/**
 * Client-side profile switcher. It first fetches the current session (which
 * establishes the HttpOnly session cookie and returns a CSRF token), then
 * submits the switch request with the CSRF token in the x-csrf-token header.
 */
export function ProfileSwitcher({ profiles }: ProfileSwitcherProps) {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const res = await fetch('/api/v1/auth/session', { method: 'GET', credentials: 'include' });
        const data = (await res.json()) as { csrfToken?: string };
        if (!cancelled && typeof data.csrfToken === 'string') {
          setCsrfToken(data.csrfToken);
        }
      } catch {
        // Leave token null; submit will surface a clear error.
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function switchProfile(profileId: string) {
    setError(null);
    if (!csrfToken) {
      setError('Session is not ready yet. Please try again.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/v1/profiles/active', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ profileId, returnTo: '/' }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { detail?: string } | null;
        setError(body?.detail ?? 'Failed to switch profile.');
        return;
      }
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            disabled={busy}
            onClick={() => void switchProfile(profile.id)}
            className="h-full w-full rounded-[2rem] border border-white/10 bg-white/6 p-8 text-left transition hover:border-cinenova-accent/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinenova-accent"
            aria-label={`Switch to ${profile.name} profile`}
          >
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-cinenova-accent to-[#642116] text-3xl font-black text-white">
              {profile.avatarInitial}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <p className="text-lg font-black text-white">{profile.name}</p>
              {profile.pinProtected ? (
                <Lock aria-hidden="true" className="h-4 w-4 text-cinenova-muted" />
              ) : null}
              {profile.active ? (
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-300" />
              ) : null}
            </div>
            <p className="mt-2 text-center text-sm text-cinenova-muted">
              {profile.type} · up to {profile.maturityCeiling.replace('_', '-')} ·{' '}
              {profile.autoplay ? 'autoplay on' : 'autoplay off'}
            </p>
            <p className="mt-4 rounded-2xl bg-black/30 p-3 text-center text-xs text-cinenova-muted">
              {profile.active ? 'Active profile' : 'Switch profile'}
            </p>
          </button>
        ))}
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl bg-red-900/20 p-3 text-center text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
