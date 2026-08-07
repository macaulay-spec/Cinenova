import type { NextRequest } from 'next/server';
import { resolvePrincipalForProfile } from './local-principal';
import { problemResponse } from './problem';
import { isCsrfValid, resolveSession } from './session';

/**
 * Gate a state-changing (mutation) request behind a valid, session-bound CSRF
 * token. Returns the authenticated session on success, or a NextResponse
 * Problem Details error to short-circuit the handler.
 *
 * Usage in a route handler:
 *   const guard = await requireCsrf(request);
 *   if ('response' in guard) return guard.response;
 *   const { session, profileId } = guard;
 */
export async function requireCsrf(request: Request | NextRequest) {
  const resolved = await resolveSession();

  if (!resolved.session || !resolved.authenticated) {
    return {
      response: problemResponse({
        type: 'https://docs.cinenova.local/errors/auth-invalid',
        title: 'Authentication required',
        status: 401,
        code: 'AUTH_INVALID',
        detail: 'A valid session is required to perform this action.',
      }),
    };
  }

  const principal = resolvePrincipalForProfile(resolved.profileId);

  if (!isCsrfValid(request, resolved.session, principal.userId)) {
    return {
      response: problemResponse({
        type: 'https://docs.cinenova.local/errors/csrf-invalid',
        title: 'CSRF validation failed',
        status: 403,
        code: 'CSRF_INVALID',
        detail: 'A valid CSRF token must accompany this request.',
      }),
    };
  }

  return {
    session: resolved.session,
    profileId: resolved.profileId,
    principal,
  };
}
