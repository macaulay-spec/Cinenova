# ADR-0007: Persistent Session and CSRF Boundary

- **Status:** Accepted
- **Date:** 2026-08-02
- **Related:** ADR-0006 (identity/profile/session foundation), ADR-0003 (rights policy)

## Context

CineNova's first identity milestone introduced a request-scoped demo principal
and an active-profile cookie, but it did not have a durable session boundary or
protection against cross-site request forgery (CSRF) on state-changing requests.
Before wiring a real database, we need a well-defined persistence boundary and a
security control that survives a later swap to PostgreSQL.

We must also respect the product's legal/security constraints: never store or
echo raw credentials, keep signed/private values server-side, and default to
deny for anything not explicitly permitted.

## Decision

We introduce a session and CSRF boundary with these properties:

1. **Sessions are server-side records** identified by a hash of an opaque raw
   token. Only the SHA-256 hash of the token is ever stored or compared; the raw
   token travels only inside an `HttpOnly`, `SameSite=Strict` cookie and is
   returned to the caller exactly once at issuance.

2. **Repository ports define persistence.** `SessionRepository`,
   `ProfileRepository`, `DeviceRepository`, `AuditLogRepository`, and
   `UserRepository` interfaces live in `@cinenova/domain`. In-memory adapters
   implement them for local/demo/test operation. A Prisma/PostgreSQL adapter
   will implement the same ports without changing callers.

3. **CSRF tokens are stateless and HMAC-signed.** A CSRF token is a
   `base64url(payload).signature` value signed with `CSRF_SECRET`, bound to the
   session id and user id, and expires after a short TTL. Verification uses a
   constant-time comparison and rejects tokens not bound to the current session
   or user, tokens past their expiry, and malformed/short tokens.

4. **State-changing requests require a valid session-bound CSRF token.** The
   `x-csrf-token` header must be present and valid on mutations (profile switch,
   profile create, playback session creation, download creation, session
   revoke). Requests without a session return `401 AUTH_INVALID`; requests with
   a session but an invalid/missing CSRF token return `403 CSRF_INVALID`.

5. **Profile switching keeps the session's bound profile in sync.** When a user
   switches profiles, the session record's `profileId` is updated so subsequent
   policy decisions use the switched profile. This is what makes the maturity
   gate (e.g. Kids profile cannot play R-rated content) hold end-to-end.

6. **Production requires secrets.** `SESSION_SECRET` and `CSRF_SECRET` are
   mandatory in production via the config parser; in local/dev they may fall
   back to derived values so local flows still exercise the CSRF boundary.

## Consequences

- State-changing API routes now fail closed against forged cross-site requests.
- The raw session token is never stored, logged, or exposed to browser bundles.
- Callers of the API must first obtain a session and CSRF token from
  `GET /api/v1/auth/session`, then present the CSRF token on mutations. The
  profile-switching UI was updated to a client component that does this.
- The in-memory session store is per-process and not durable; it is a
  reference adapter only. Production must swap in a shared store implementing
  the same port.
- Session rotation and idle limits are defined in the domain and tested, but
  enforcement of active rotation is a follow-up milestone.

## Alternatives considered

- **Store raw tokens in a signed cookie only (stateless sessions):** rejected
  because it couples the security-critical session record to the client and
  makes revocation/rotation harder.
- **Double-submit cookie CSRF without a header check:** rejected because a
  plain cookie echo is weaker than requiring a signed, session-bound header
  token.
- **PostgreSQL-backed adapter now:** deferred because the Prisma engine could
  not be downloaded in this environment; the ports make the later swap additive.
