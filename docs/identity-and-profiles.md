# Identity, Profiles, Sessions, and RBAC Foundation

## Current milestone

This milestone introduces the server-side identity/profile contract without pretending a production
identity provider is configured. The demo principal is local, but the API and UI now resolve:

- user identity summary
- active profile
- all profiles
- device list
- entitlement snapshot
- roles and derived permissions

## Endpoints

- `GET /api/v1/me` — returns the active principal contract plus session status with no-store caching.
- `GET /api/v1/auth/session` — establishes/resolves the server-side session and returns a CSRF token.
- `POST /api/v1/auth/session/revoke` — revokes the current session and clears its cookie.
- `GET /api/v1/profiles` — returns profiles and active profile.
- `POST /api/v1/profiles` — validates the profile creation request and returns a 202 non-persisted
  contract response until the database identity writer is connected (CSRF-protected).
- `POST /api/v1/profiles/active` — switches the active profile and keeps the session's bound profile
  in sync (CSRF-protected).
- `GET /api/v1/admin/audit` — demonstrates server-side RBAC denial for principals without `audit:read`.

## Active profile cookie

The active profile ID is stored in `cinenova_active_profile` with:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production
- path `/`
- 180-day max age

The profile ID is not a secret, but keeping it HttpOnly prevents client scripts from mutating the
server-side profile context directly.

## Policy impact

Playback and download APIs now call the request-scoped principal resolver. The selected profile changes
maturity enforcement. For example, selecting the Kids profile makes adult/R-rated titles fail the same
server-side rights policy used by playback sessions.

## Session and CSRF boundary

Sessions are server-side records identified by the hash of an opaque raw token; the raw token lives
only in an `HttpOnly`, `SameSite=Strict` cookie. Mutations require a valid session-bound CSRF token in
the `x-csrf-token` header. See `docs/session-and-csrf.md` and `docs/adr/0007-session-csrf-boundary.md`.

## Production work remaining

- Passwordless/email and social auth adapters.
- Argon2id password storage for password option.
- MFA-ready account recovery and device binding.
- Persistent profile CRUD through Prisma repositories (replacing the in-memory adapters).
- Active session rotation (idle threshold enforcement) and concurrent-session limits.
- Immutable PostgreSQL-backed audit writer.
- Shared durable session store for multi-instance deployments.
