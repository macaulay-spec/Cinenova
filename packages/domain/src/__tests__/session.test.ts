import { describe, expect, it } from 'vitest';
import {
  hashSessionToken,
  isSessionActive,
  issueCsrfToken,
  issueSession,
  newSessionToken,
  revokeSession,
  rotateSession,
  sessionNeedsRotation,
  sessionsToEvictForLimit,
  touchSession,
  verifyCsrfToken,
} from '../session';

const SECRET = '01234567890123456789012345678901';

describe('session token', () => {
  it('issues a raw token and stores only its hash', () => {
    const issued = issueSession({
      userId: 'user-1',
      profileId: 'profile-1',
      deviceId: 'device-1',
    });

    expect(issued.token).toBeTruthy();
    expect(issued.session.tokenHash).toBe(hashSessionToken(issued.token));
    expect(issued.session.tokenHash).not.toBe(issued.token);
  });

  it('produces a fresh token each call', () => {
    expect(newSessionToken()).not.toBe(newSessionToken());
  });

  it('hashes deterministically', () => {
    expect(hashSessionToken('abc')).toBe(hashSessionToken('abc'));
    expect(hashSessionToken('abc')).not.toBe(hashSessionToken('abd'));
  });
});

describe('session lifecycle', () => {
  const now = new Date('2026-08-02T12:00:00.000Z');

  it('is active when not revoked and not expired', () => {
    const { session } = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    expect(isSessionActive(session, now)).toBe(true);
  });

  it('is inactive after expiry', () => {
    const { session } = issueSession({
      userId: 'u',
      profileId: 'p',
      deviceId: 'd',
      sessionTtlMs: 1000,
      now,
    });
    const later = new Date(now.getTime() + 2000);
    expect(isSessionActive(session, later)).toBe(false);
  });

  it('is inactive after revocation', () => {
    const { session } = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    const revoked = revokeSession(session, now);
    expect(revoked.revokedAt).not.toBeNull();
    expect(isSessionActive(revoked, now)).toBe(false);
  });

  it('rotates after idle threshold', () => {
    const { session } = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    expect(sessionNeedsRotation(session, now, 1000 * 60 * 60)).toBe(false);

    const touched = touchSession(session, now);
    expect(sessionNeedsRotation(touched, now, 1000 * 60 * 60)).toBe(false);

    const idleLater = new Date(now.getTime() + 1000 * 60 * 60 + 1);
    expect(sessionNeedsRotation(touched, idleLater, 1000 * 60 * 60)).toBe(true);
  });
});

describe('session rotation and limits', () => {
  const now = new Date('2026-08-02T12:00:00.000Z');

  it('rotates a session to a fresh token while preserving id', () => {
    const { session } = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    const rotated = rotateSession(session, { now });
    expect(rotated.session.id).toBe(session.id);
    expect(rotated.session.tokenHash).not.toBe(session.tokenHash);
    expect(rotated.session.userId).toBe(session.userId);
  });

  it('evicts oldest sessions beyond the concurrent limit', () => {
    const s1 = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    const s2 = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    const s3 = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    const toEvict = sessionsToEvictForLimit([s1.session, s2.session, s3.session], 2);
    expect(toEvict.map((s) => s.id)).toEqual([s1.session.id]);
  });

  it('evicts nothing when within the limit', () => {
    const s1 = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    const s2 = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd', now });
    expect(sessionsToEvictForLimit([s1.session, s2.session], 2)).toEqual([]);
  });
});

describe('csrf tokens', () => {
  const now = new Date('2026-08-02T12:00:00.000Z');

  it('issues a token that verifies', () => {
    const token = issueCsrfToken({
      secret: SECRET,
      sessionId: 'session-1',
      userId: 'user-1',
      now,
    });
    expect(
      verifyCsrfToken({ token, secret: SECRET, sessionId: 'session-1', userId: 'user-1', now }),
    ).toBe(true);
  });

  it('rejects a token bound to a different session or user', () => {
    const token = issueCsrfToken({
      secret: SECRET,
      sessionId: 'session-1',
      userId: 'user-1',
      now,
    });
    expect(
      verifyCsrfToken({ token, secret: SECRET, sessionId: 'session-2', userId: 'user-1', now }),
    ).toBe(false);
    expect(
      verifyCsrfToken({ token, secret: SECRET, sessionId: 'session-1', userId: 'user-2', now }),
    ).toBe(false);
  });

  it('rejects an expired token', () => {
    const token = issueCsrfToken({
      secret: SECRET,
      sessionId: 'session-1',
      userId: 'user-1',
      now,
      ttlMs: 1000,
    });
    const later = new Date(now.getTime() + 2000);
    expect(
      verifyCsrfToken({
        token,
        secret: SECRET,
        sessionId: 'session-1',
        userId: 'user-1',
        now: later,
      }),
    ).toBe(false);
  });

  it('rejects a token signed with a different secret', () => {
    const token = issueCsrfToken({
      secret: SECRET,
      sessionId: 'session-1',
      userId: 'user-1',
      now,
    });
    expect(
      verifyCsrfToken({
        token,
        secret: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        sessionId: 'session-1',
        userId: 'user-1',
        now,
      }),
    ).toBe(false);
  });

  it('rejects malformed tokens', () => {
    expect(verifyCsrfToken({ token: '', secret: SECRET, sessionId: 's', userId: 'u', now })).toBe(
      false,
    );
    expect(
      verifyCsrfToken({ token: 'no-dot', secret: SECRET, sessionId: 's', userId: 'u', now }),
    ).toBe(false);
    expect(
      verifyCsrfToken({ token: '...', secret: SECRET, sessionId: 's', userId: 'u', now }),
    ).toBe(false);
  });
});
