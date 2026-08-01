import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

/**
 * CineNova session and CSRF boundary primitives.
 *
 * Design principles:
 * - Only the SHA-256 hash of a session token is ever stored or compared
 *   server-side. The raw token is returned to the caller exactly once at
 *   issuance and never persisted, logged, or echoed back.
 * - Sessions are short-lived and rotated; expiry is evaluated at request time
 *   using an explicit clock so behaviour is testable and timezone-independent.
 * - CSRF tokens are statelessly signed with HMAC-SHA256 and bound to the
 *   session and user, so a stolen cookie cannot be used to forge a CSRF token
 *   and a cross-site request cannot carry a valid token.
 */

export interface SessionRecord {
  id: string;
  userId: string;
  profileId: string;
  deviceId: string;
  /** SHA-256 hex digest of the raw token. Never store the raw token. */
  tokenHash: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ip: string | null;
}

export interface IssueSessionOptions {
  userId: string;
  profileId: string;
  deviceId: string;
  sessionTtlMs?: number;
  userAgent?: string;
  ip?: string;
  /** Injectable clock for deterministic tests. Defaults to now. */
  now?: Date;
}

export interface IssuedSession {
  /** The raw, single-use bearer token. Return to the caller once; never store. */
  token: string;
  session: SessionRecord;
}

export interface CsrfIssueInput {
  secret: string;
  sessionId: string;
  userId: string;
  now?: Date;
  ttlMs?: number;
}

export interface CsrfVerifyInput {
  token: string;
  secret: string;
  sessionId: string;
  userId: string;
  now?: Date;
}

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days absolute lifetime
const DEFAULT_SESSION_IDLE_TTL_MS = 1000 * 60 * 60 * 12; // 12h idle before forced rotation
const DEFAULT_CSRF_TTL_MS = 1000 * 60 * 10; // 10 minutes

export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function newSessionId(): string {
  return randomUUID();
}

export function sessionExpiresAt(now: Date, ttlMs: number): Date {
  return new Date(now.getTime() + ttlMs);
}

export function issueSession(options: IssueSessionOptions): IssuedSession {
  const now = options.now ?? new Date();
  const ttlMs = options.sessionTtlMs ?? DEFAULT_SESSION_TTL_MS;
  const token = newSessionToken();

  const session: SessionRecord = {
    id: newSessionId(),
    userId: options.userId,
    profileId: options.profileId,
    deviceId: options.deviceId,
    tokenHash: hashSessionToken(token),
    createdAt: now,
    lastSeenAt: now,
    expiresAt: sessionExpiresAt(now, ttlMs),
    revokedAt: null,
    userAgent: options.userAgent ?? null,
    ip: options.ip ?? null,
  };

  return { token, session };
}

export function isSessionActive(session: SessionRecord, now: Date): boolean {
  if (session.revokedAt !== null) {
    return false;
  }
  if (now.getTime() >= session.expiresAt.getTime()) {
    return false;
  }
  return session.tokenHash.length === 64;
}

export function sessionNeedsRotation(
  session: SessionRecord,
  now: Date,
  idleTtlMs = DEFAULT_SESSION_IDLE_TTL_MS,
): boolean {
  const idleMs = now.getTime() - session.lastSeenAt.getTime();
  return idleMs >= idleTtlMs;
}

/** Update last-seen and slide the absolute expiry window. Used to touch an active session. */
export function touchSession(
  session: SessionRecord,
  now: Date,
  ttlMs = DEFAULT_SESSION_TTL_MS,
): SessionRecord {
  return {
    ...session,
    lastSeenAt: now,
    expiresAt: sessionExpiresAt(now, ttlMs),
  };
}

export function revokeSession(session: SessionRecord, now: Date): SessionRecord {
  return {
    ...session,
    revokedAt: now,
  };
}

function encodeCsrfPayload(sessionId: string, userId: string, expMs: number): string {
  return Buffer.from(JSON.stringify({ sid: sessionId, uid: userId, exp: expMs }), 'utf8').toString(
    'base64url',
  );
}

function decodeCsrfPayload(payload: string): { sid: string; uid: string; exp: number } | null {
  try {
    const raw = Buffer.from(payload, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as { sid?: unknown; uid?: unknown; exp?: unknown };
    if (
      typeof parsed.sid !== 'string' ||
      typeof parsed.uid !== 'string' ||
      typeof parsed.exp !== 'number'
    ) {
      return null;
    }
    return { sid: parsed.sid, uid: parsed.uid, exp: parsed.exp };
  } catch {
    return null;
  }
}

function signCsrf(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('base64url');
}

/** Issue a stateless, HMAC-signed CSRF token bound to a session and user. */
export function issueCsrfToken(input: CsrfIssueInput): string {
  const now = input.now ?? new Date();
  const ttlMs = input.ttlMs ?? DEFAULT_CSRF_TTL_MS;
  const exp = now.getTime() + ttlMs;
  const payload = encodeCsrfPayload(input.sessionId, input.userId, exp);
  const signature = signCsrf(input.secret, payload);
  return `${payload}.${signature}`;
}

/**
 * Verify a CSRF token is well-formed, signed with the expected secret, bound to
 * the provided session/user, and not expired.
 */
export function verifyCsrfToken(input: CsrfVerifyInput): boolean {
  const now = input.now ?? new Date();
  const lastDot = input.token.lastIndexOf('.');
  if (lastDot <= 0) {
    return false;
  }

  const payload = input.token.slice(0, lastDot);
  const signature = input.token.slice(lastDot + 1);

  const expected = signCsrf(input.secret, payload);
  const a = Buffer.from(signature, 'base64url');
  const b = Buffer.from(expected, 'base64url');
  if (a.length !== b.length) {
    return false;
  }
  // Constant-time comparison avoids timing side channels on the signature.
  if (!timingSafeEqual(a, b)) {
    return false;
  }

  const decoded = decodeCsrfPayload(payload);
  if (!decoded) {
    return false;
  }
  if (decoded.sid !== input.sessionId || decoded.uid !== input.userId) {
    return false;
  }
  if (now.getTime() > decoded.exp) {
    return false;
  }
  return true;
}
