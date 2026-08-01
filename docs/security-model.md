# CineNova Security Model

## Enforcement rules

- Authorization is server-side. Client feature flags only hide/show affordances.
- Rights checks run before playback/download manifest resolution.
- Provider calls are server-only.
- No generic proxy, downloader, DRM bypass, geo-bypass, or arbitrary URL fetcher is exposed.
- Offline video is disabled unless rights explicitly allow it and a lawful delivery mechanism exists.

## Sessions

Sessions are server-side records identified by the SHA-256 hash of an opaque raw token. The raw token
travels only in an `HttpOnly`, `SameSite=Strict` cookie and is never stored, logged, or exposed to
browser bundles. The persistence boundary is defined by repository ports in `@cinenova/domain`; an
in-memory adapter backs local/demo/test operation, and a PostgreSQL adapter will implement the same
ports.

State-changing (mutation) requests require a valid session-bound CSRF token presented in the
`x-csrf-token` header. Requests without a session return `401 AUTH_INVALID`; requests with a session
but an invalid or missing CSRF token return `403 CSRF_INVALID`. CSRF tokens are stateless, HMAC-signed
with `CSRF_SECRET`, bound to the session and user, and short-lived.

Production sessions additionally use `Secure` cookies with rotation, revocation, device binding where
appropriate, and rate limits. Session rotation enforcement is a follow-up milestone.

## Secrets

Secrets live in a secret manager. `.env.example` contains placeholders only. Logs use structured JSON with
redaction for sensitive keys and signed URL query parameters.

## Provider source validation

Playback source resolution must validate:

- HTTPS protocol.
- Approved outbound host.
- No private, loopback, link-local, or metadata IP targets.
- Short TTL.
- No persistence of signed provider URLs.

The first milestone implements HTTPS and host allowlist checks for mock media. DNS/IP hardening is next.
