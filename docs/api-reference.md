# CineNova API Reference

The source OpenAPI 3.1 document is `docs/openapi.yaml`.

Initial endpoints:

- `GET /api/v1/me` — principal, active profile, devices, entitlement, RBAC permissions, and session status.
- `GET /api/v1/auth/session` — establish/resolve the session, set the session cookie, and return a CSRF token.
- `POST /api/v1/auth/session/revoke` — revoke the current session and clear its cookie (CSRF-protected).
- `GET /api/v1/profiles` — profile list and active profile.
- `POST /api/v1/profiles/active` — switch active profile (CSRF-protected); keeps the session's bound profile in sync.
- `GET /api/v1/catalogue` — cached public home rails from the mock licensed catalogue.
- `GET /api/v1/search?q=&region=NG` — public search with validation.
- `GET /api/v1/title/{slug}` — title details and rights explanation.
- `POST /api/v1/playback/session` — creates a no-store, rights-gated playback session (CSRF-protected).
- `POST /api/v1/downloads` — returns authorized or unavailable download state after policy checks (CSRF-protected).
- `GET /api/v1/health` — health/readiness result.
- `GET /api/v1/admin/provider-health` — provider health contract for admin dashboards.

Mutations require a valid session-bound CSRF token in the `x-csrf-token` header. Requests without a
session return `401 AUTH_INVALID`; requests with a session but an invalid/missing CSRF token return
`403 CSRF_INVALID`.

Problem responses use stable codes such as `VALIDATION_FAILED`, `RIGHTS_DENIED`,
`PROFILE_RESTRICTED`, `AUTH_INVALID`, `CSRF_INVALID`, and `NOT_FOUND`. Production should generate
published HTML docs from the OpenAPI file during CI.
