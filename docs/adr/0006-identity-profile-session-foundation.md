# ADR 0006: Request-scoped profile context before persistent identity

## Status

Accepted

## Context

CineNova needs profile maturity checks before playback/download. Full identity, billing, and session
persistence require external providers and production secrets that are not configured in the first
milestones.

## Decision

Introduce a request-scoped local principal and active-profile cookie. The contracts and UI match the
future production shape, while persistence remains explicitly non-production until repositories and auth
providers are connected.

## Consequences

- Playback/download policy now responds to the active profile.
- Profile switching is visible and testable without external identity services.
- The demo profile cookie is HttpOnly/SameSite and not used as an authorization boundary.
- Production must replace the local principal with verified sessions, CSRF, token hashing, and database-backed profiles.
