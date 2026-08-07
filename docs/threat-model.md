# CineNova Threat Model

## Assets

- User identity, sessions, profiles, devices, parental PINs.
- Payment provider identifiers and webhook payload summaries.
- Catalogue, rights windows, plan entitlement snapshots.
- Provider credentials, source URLs, signed manifests, cookies, auth headers.
- Playback/download authorization records.
- Audit logs, analytics events, and privacy requests.

## Primary threats and controls

| Threat | Risk | Controls in this milestone | Next controls |
| --- | --- | --- | --- |
| Provider key leakage | Unauthorized provider access | `.env.example` placeholders only, server-only adapter, redaction helpers | Secret manager, CI secret scanning, runtime egress controls |
| Rights bypass | Illegal playback/download | Pure domain policy, default-deny tests, route-level checks | Central policy service, audit, chaos tests for stale rights |
| SSRF via media URLs | Internal network exposure | Playback allowlist and HTTPS validation | DNS/IP pinning, private/link-local rejection, egress proxy |
| Signed URL persistence | Long-lived replay or leakage | Mock source only, no provider signed URL storage | Redis short TTL, hashed fingerprints, log scrubbing gates |
| Account takeover | Unauthorized viewing/payment changes | Session/auth architecture documented | Passwordless, Argon2id, MFA-ready, rate limits, CSRF |
| Child profile bypass | Mature content exposure | Maturity policy checks | PIN flow, server-side profile context, E2E tests |
| Payment webhook replay | Fraud/inconsistent entitlement | Idempotency schema | Signed webhook verification and reconciliation jobs |
| Admin misuse | Rights/catalogue abuse | RBAC package and admin IA | MFA, permission checks, immutable audit logs |
| Dependency compromise | Build/runtime compromise | CI audit step scaffold | SBOM, lockfile review, SAST/DAST, container signing |
| Privacy violation | Regulatory/user trust impact | Consent/delete models | Preference center, export/delete workflow, data inventory |

## Abuse cases

1. User changes title ID or asset ID in a playback request.
   - Domain policy verifies title/right/asset mapping before manifest resolution.
2. User tries an unlicensed territory.
   - Policy returns `TERRITORY_NOT_ALLOWED` without exposing contract details.
3. Provider returns a private or non-HTTPS source URL.
   - Playback helper rejects source host/protocol.
4. Operator accidentally enables GZMovie routing without credentials.
   - Adapter health reports disabled/unhealthy and public routes are not wired to its data normalization.
5. Logs include a signed provider URL.
   - Redaction helpers remove sensitive keys and signed query parameters.

## Open items

- Formal STRIDE diagram for auth, billing, provider, and playback services.
- CSP nonce/hash strategy integrated with Next.js rendering.
- Automated secret scanning and dependency review in CI.
- Penetration testing and legal review before production launch.
