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

- `GET /api/v1/me` — returns the active principal contract with no-store caching.
- `GET /api/v1/profiles` — returns profiles and active profile.
- `POST /api/v1/profiles` — validates the profile creation request and returns a 202 non-persisted
  contract response until the database identity writer is connected.
- `POST /api/v1/profiles/active` — switches the active profile by setting an HttpOnly SameSite cookie.
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

## Production work remaining

- Passwordless/email and social auth adapters.
- Argon2id password storage for password option.
- MFA-ready account recovery and device binding.
- Persistent profile CRUD through Prisma repositories.
- CSRF tokens for all browser mutations.
- Session rotation/revocation and token hashing.
- Immutable PostgreSQL-backed audit writer.
