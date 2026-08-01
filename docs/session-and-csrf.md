# Session and CSRF Boundary

This document describes how CineNova authenticates requests and protects
state-changing endpoints against cross-site request forgery. It is the practical
companion to [ADR-0007](adr/0007-session-csrf-boundary.md).

## Overview

- **Sessions** are server-side records. Only the SHA-256 hash of the raw token is
  stored or compared; the raw token lives only in an `HttpOnly`, `SameSite=Strict`
  cookie.
- **CSRF** tokens are stateless, HMAC-signed, session- and user-bound, and
  short-lived. Mutations must present a valid token in the `x-csrf-token` header.
- **Repository ports** (`SessionRepository`, `ProfileRepository`,
  `DeviceRepository`, `AuditLogRepository`, `UserRepository`) define the
  persistence boundary. In-memory adapters are the current reference
  implementation.

## Request flow

1. Client calls `GET /api/v1/auth/session`. This either resolves an existing
   session from the `cinenova_session` cookie or creates one, sets the session
   cookie, and returns a CSRF token:
   ```json
   {
     "authenticated": true,
     "sessionId": "…",
     "profileId": "local-profile-adult",
     "csrfToken": "…",
     "csrfRequired": true,
     "expiresAt": "…"
   }
   ```
2. The client keeps the CSRF token in memory (it must not be stored in a cookie
   readable by JS alongside a `SameSite` restriction; the short TTL and session
   binding keep it safe).
3. For any state-changing call, the client sends the token in the
   `x-csrf-token` header:
   ```
   POST /api/v1/profiles/active
   x-csrf-token: <token>
   Content-Type: application/json
   {"profileId":"local-profile-kids","returnTo":"/"}
   ```
4. The server verifies the token is signed with `CSRF_SECRET`, bound to the
   current session and user, and not expired. It then performs the mutation.

## Endpoints and guard

The `requireCsrf(request)` guard in `apps/web/lib/csrf-guard.ts` is used by
mutation route handlers. It returns either a problem response to short-circuit
the handler, or the resolved session/principal for success:

- No session → `401 AUTH_INVALID`
- Session present but missing/invalid CSRF token → `403 CSRF_INVALID`

Routes currently protected:

- `POST /api/v1/profiles/active` — switch active profile
- `POST /api/v1/profiles` — create a profile
- `POST /api/v1/playback/session` — create a playback session
- `POST /api/v1/downloads` — authorize a download
- `POST /api/v1/auth/session/revoke` — revoke current session

## Profile switching

When a user switches profiles, `POST /api/v1/profiles/active` updates the
session record's `profileId` so subsequent policy checks use the switched
profile. This is what makes the maturity gate hold end-to-end: after switching
to a Kids profile, requesting an R-rated title returns `403 PROFILE_RESTRICTED`.

## Secrets and cookies

- `SESSION_SECRET` and `CSRF_SECRET` are mandatory in production (enforced by
  the config parser). In local/dev they may fall back to derived values so local
  flows still exercise the CSRF boundary.
- The session cookie is `HttpOnly`, `SameSite=Strict`, `Secure` in production,
  and is cleared on revoke.
- The raw session token must never be logged, stored in a database, or sent to
  the browser other than in the HttpOnly cookie.

## Current limitations

- The in-memory session store is per-process and not durable. Production must
  use a shared store (Redis or PostgreSQL) implementing the same
  `SessionRepository` port.
- Active session rotation (re-issuing the token on idle) and concurrent-session
  limits are defined/tested in the domain but not yet enforced in the web layer.
- `CSRF_SECRET` is required in production; the derived local fallback is not
  suitable for production.

## Security properties

- A stolen CSRF token cannot be replayed after expiry or after the session is
  revoked.
- A CSRF token for user A cannot be used for user B or for a different session
  id.
- A cross-site request cannot read the HttpOnly session cookie, so it cannot
  forge a valid CSRF token.
- Signature comparison is constant-time (`timingSafeEqual`).
