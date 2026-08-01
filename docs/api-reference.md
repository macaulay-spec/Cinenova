# CineNova API Reference

The source OpenAPI 3.1 document is `docs/openapi.yaml`.

Initial endpoints:

- `GET /api/v1/me` — request-scoped principal, active profile, devices, entitlement, and RBAC permissions.
- `GET /api/v1/profiles` — profile list and active profile.
- `POST /api/v1/profiles/active` — switch active profile using an HttpOnly SameSite cookie.
- `GET /api/v1/catalogue` — cached public home rails from the mock licensed catalogue.
- `GET /api/v1/search?q=&region=NG` — public search with validation.
- `GET /api/v1/title/{slug}` — title details and rights explanation.
- `POST /api/v1/playback/session` — creates a no-store, rights-gated playback session.
- `POST /api/v1/downloads` — returns authorized or unavailable download state after policy checks.
- `GET /api/v1/health` — health/readiness result.
- `GET /api/v1/admin/provider-health` — provider health contract for admin dashboards.

Problem responses use stable codes such as `VALIDATION_FAILED`, `RIGHTS_DENIED`,
`PROFILE_RESTRICTED`, and `NOT_FOUND`. Production should generate published HTML docs from the
OpenAPI file during CI.
