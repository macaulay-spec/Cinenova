import { NextResponse } from 'next/server';
import { getActiveProfileId, resolvePrincipalForProfile } from '../../../../../lib/local-principal';
import {
  createCsrfToken,
  createSessionForProfile,
  resolveSession,
  rotateActiveSession,
  sessionIdleRequiresRotation,
  setSessionCookie,
} from '../../../../../lib/session';
import { SESSION_TTL_SECONDS } from '../../../../../lib/session-constants';

export const dynamic = 'force-dynamic';

/**
 * Establish (or re-establish) a server-side session for the active demo
 * principal and return a CSRF token bound to that session. State-changing
 * requests must present this CSRF token in the x-csrf-token header.
 *
 * Security notes:
 * - The raw session token travels only in an HttpOnly, SameSite=Strict cookie.
 * - The CSRF token is returned to the caller and is required to mutate state.
 */
export async function GET() {
  const existing = await resolveSession();

  if (existing.session) {
    // Rotate the token when the session has been idle past the threshold, so a
    // leaked token cannot be replayed forever. On rotation we set a new cookie.
    if (sessionIdleRequiresRotation(existing.session)) {
      const rotated = await rotateActiveSession(existing.session);
      const csrfToken = createCsrfToken(rotated.session.id, rotated.session.userId);
      const response = NextResponse.json(
        {
          authenticated: true,
          rotated: true,
          sessionId: rotated.session.id,
          profileId: rotated.session.profileId,
          csrfToken,
          csrfRequired: true,
          expiresAt: rotated.session.expiresAt.toISOString(),
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );
      setSessionCookie(response, rotated.token, SESSION_TTL_SECONDS);
      return response;
    }

    const csrfToken = createCsrfToken(existing.session.id, existing.session.userId);
    return NextResponse.json(
      {
        authenticated: true,
        sessionId: existing.session.id,
        profileId: existing.profileId,
        csrfToken,
        csrfRequired: true,
        expiresAt: existing.session.expiresAt.toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const profileId = await getActiveProfileId();
  const principal = resolvePrincipalForProfile(profileId);
  const { token, session } = await createSessionForProfile(
    principal.userId,
    profileId,
    'local-browser',
  );

  const csrfToken = createCsrfToken(session.id, session.userId);

  const response = NextResponse.json(
    {
      authenticated: true,
      sessionId: session.id,
      profileId,
      csrfToken,
      csrfRequired: true,
      expiresAt: session.expiresAt.toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );

  setSessionCookie(response, token, SESSION_TTL_SECONDS);
  return response;
}
