import { cookies, headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { parseEnv } from '@cinenova/config';
import {
  CSRF_HEADER,
  CSRF_TTL_MS,
  SESSION_COOKIE,
  SESSION_IDLE_TTL_MS,
  SESSION_TTL_MS,
} from './session-constants';
import {
  InMemorySessionRepository,
  hashSessionToken,
  isSessionActive,
  issueCsrfToken,
  issueSession,
  rotateSession,
  revokeSession,
  sessionsToEvictForLimit,
  touchSession,
  verifyCsrfToken,
  type SessionRepository,
  type SessionRecord,
} from '@cinenova/domain';

export { CSRF_HEADER, SESSION_COOKIE };

export function getCsrfSecret(): string {
  const env = parseEnv(process.env);
  // CSRF_SECRET is optional in dev; fall back to a derived value so local
  // flows still enforce CSRF. In production parseEnv() requires CSRF_SECRET.
  return env.CSRF_SECRET ?? 'local-csrf-secret-00000000000000000000';
}

/**
 * A single session store is shared per process. In a multi-instance
 * deployment this must be swapped for a shared durable store (Redis or
 * PostgreSQL) implementing the same SessionRepository port.
 */
let sessionRepo: SessionRepository | null = null;

export function getSessionRepository(): SessionRepository {
  if (!sessionRepo) {
    sessionRepo = new InMemorySessionRepository();
  }
  return sessionRepo;
}

/**
 * Build the session repository from the configured persistence backend.
 * - "memory" (default): in-memory, per-process, non-durable (local/demo/tests).
 * - "postgres": Prisma-backed adapters from @cinenova/db. Requires the Prisma
 *   client to be generated (`npx prisma generate`) and a reachable database.
 *
 * The web app currently keeps the in-memory default so local/demo operation
 * works without a database. Production should set PERSISTENCE=postgres.
 */
export function buildSessionRepository(
  backend: 'memory' | 'postgres' = 'memory',
): SessionRepository {
  if (backend === 'postgres') {
    throw new Error(
      'PostgreSQL persistence is not yet wired at runtime in the web app. ' +
        'Run `prisma generate` from apps/web and connect a database, then enable it.',
    );
  }
  return new InMemorySessionRepository();
}

export interface SessionResolution {
  session: SessionRecord | null;
  tokenHash: string;
  profileId: string;
  authenticated: boolean;
}

/**
 * Resolve the session for the current request from the HttpOnly session
 * cookie. Returns the active session (or null) plus the hashed token.
 */
export async function resolveSession(): Promise<SessionResolution> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return { session: null, tokenHash: '', profileId: '', authenticated: false };
  }

  const tokenHash = hashSessionToken(token);
  const session = await getSessionRepository().findByTokenHash(tokenHash);
  if (!session || !isSessionActive(session, new Date())) {
    return { session: null, tokenHash, profileId: '', authenticated: false };
  }

  return {
    session,
    tokenHash,
    profileId: session.profileId,
    authenticated: true,
  };
}

/**
 * Set an HttpOnly, SameSite=Strict session cookie carrying the raw session
 * token. The raw token is only ever present in this HttpOnly cookie.
 */
export function setSessionCookie(
  response: NextResponse,
  token: string,
  maxAgeSeconds: number,
): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function createSessionForProfile(
  userId: string,
  profileId: string,
  deviceId: string,
  opts?: { concurrentLimit?: number },
): Promise<{ token: string; session: SessionRecord }> {
  const repo = getSessionRepository();
  const now = new Date();
  const userAgent = (await headers()).get('user-agent');
  const issued = issueSession({
    userId,
    profileId,
    deviceId,
    sessionTtlMs: SESSION_TTL_MS,
    ...(userAgent ? { userAgent } : {}),
    now,
  });

  await repo.create(issued.session);

  // Enforce the concurrent-session limit: evict the oldest active sessions.
  const limit = opts?.concurrentLimit ?? 2;
  const active = await repo.listActiveByUser(userId, now);
  const toEvict = sessionsToEvictForLimit(active, limit);
  for (const stale of toEvict) {
    if (stale.id !== issued.session.id) {
      await repo.revokeById(stale.id, now);
    }
  }

  return { token: issued.token, session: issued.session };
}

/**
 * Rotate an existing session (e.g. on idle threshold) and return a new raw
 * token to be written into the response cookie. The old token is revoked.
 */
export async function rotateActiveSession(
  session: SessionRecord,
): Promise<{ token: string; session: SessionRecord }> {
  const rotated = rotateSession(session, { sessionTtlMs: SESSION_TTL_MS, now: new Date() });
  await getSessionRepository().update(rotated.session);
  return { token: rotated.token, session: rotated.session };
}

export async function touchActiveSession(session: SessionRecord): Promise<void> {
  await getSessionRepository().update(touchSession(session, new Date(), SESSION_TTL_MS));
}

/** Update the profile bound to a session (e.g. when the user switches profiles). */
export async function updateSessionProfile(
  sessionId: string,
  profileId: string,
): Promise<SessionRecord | null> {
  const session = await getSessionRepository().findById(sessionId);
  if (!session) {
    return null;
  }
  const updated = { ...session, profileId };
  await getSessionRepository().update(updated);
  return updated;
}

export async function revokeCurrentSession(sessionId: string): Promise<void> {
  await getSessionRepository().revokeById(sessionId, new Date());
}

export function revokeSessionRecord(session: SessionRecord): SessionRecord {
  return revokeSession(session, new Date());
}

/** Issue a CSRF token bound to the current session and user. */
export function createCsrfToken(sessionId: string, userId: string): string {
  return issueCsrfToken({
    secret: getCsrfSecret(),
    sessionId,
    userId,
    now: new Date(),
    ttlMs: CSRF_TTL_MS,
  });
}

/**
 * Verify the CSRF token presented by a request. When running through a
 * NextRequest the token is read from the x-csrf-token header. Used to gate
 * state-changing (mutation) requests.
 */
export function isCsrfValid(
  request: Request | NextRequest,
  session: SessionRecord | null,
  userId: string,
): boolean {
  if (!session) {
    return false;
  }
  const token = request.headers.get(CSRF_HEADER);
  if (!token) {
    return false;
  }
  return verifyCsrfToken({
    token,
    secret: getCsrfSecret(),
    sessionId: session.id,
    userId,
    now: new Date(),
  });
}

export function sessionIdleRequiresRotation(session: SessionRecord): boolean {
  const now = new Date();
  const idleMs = now.getTime() - session.lastSeenAt.getTime();
  return idleMs >= SESSION_IDLE_TTL_MS;
}
