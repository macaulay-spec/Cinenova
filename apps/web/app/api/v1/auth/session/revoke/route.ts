import { NextResponse } from 'next/server';
import {
  clearSessionCookie,
  getSessionRepository,
  resolveSession,
} from '../../../../../../lib/session';
import { requireCsrf } from '../../../../../../lib/csrf-guard';

export const dynamic = 'force-dynamic';

/**
 * Revoke the current session and clear the session cookie. CSRF-protected so a
 * cross-site request cannot force a user's session to be revoked.
 */
export async function POST(request: Request) {
  const csrf = await requireCsrf(request);
  if ('response' in csrf) {
    return csrf.response;
  }

  const resolved = await resolveSession();
  if (resolved.session) {
    await getSessionRepository().revokeById(resolved.session.id, new Date());
  }

  const response = NextResponse.json(
    { revoked: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  clearSessionCookie(response);
  return response;
}
