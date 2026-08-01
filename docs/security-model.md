# CineNova Security Model

## Enforcement rules

- Authorization is server-side. Client feature flags only hide/show affordances.
- Rights checks run before playback/download manifest resolution.
- Provider calls are server-only.
- No generic proxy, downloader, DRM bypass, geo-bypass, or arbitrary URL fetcher is exposed.
- Offline video is disabled unless rights explicitly allow it and a lawful delivery mechanism exists.

## Sessions

Planned production sessions use HttpOnly, Secure, SameSite cookies with rotation, revocation, CSRF
protection for mutations, device binding where appropriate, and rate limits.

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
