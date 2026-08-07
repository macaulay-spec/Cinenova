import { describe, expect, it } from 'vitest';
import {
  InMemoryAuditLogRepository,
  InMemorySessionRepository,
  issueSession,
  revokeSession,
} from '../index';

describe('InMemorySessionRepository', () => {
  it('stores and finds a session by token hash', async () => {
    const repo = new InMemorySessionRepository();
    const issued = issueSession({ userId: 'user-1', profileId: 'profile-1', deviceId: 'device-1' });

    await repo.create(issued.session);

    const found = await repo.findByTokenHash(issued.session.tokenHash);
    expect(found?.id).toBe(issued.session.id);
    // The raw token is never stored.
    expect(found?.tokenHash).not.toBe(issued.token);
  });

  it('revokes a session', async () => {
    const repo = new InMemorySessionRepository();
    const issued = issueSession({ userId: 'user-1', profileId: 'profile-1', deviceId: 'device-1' });
    await repo.create(issued.session);

    const now = new Date();
    await repo.revokeById(issued.session.id, now);

    const found = await repo.findById(issued.session.id);
    expect(found?.revokedAt).not.toBeNull();
  });

  it('lists only active sessions for a user', async () => {
    const repo = new InMemorySessionRepository();
    const a = issueSession({ userId: 'user-1', profileId: 'profile-1', deviceId: 'device-1' });
    const b = issueSession({ userId: 'user-1', profileId: 'profile-2', deviceId: 'device-2' });
    const c = issueSession({ userId: 'user-2', profileId: 'profile-3', deviceId: 'device-3' });

    await repo.create(a.session);
    await repo.create(b.session);
    await repo.create(revokeSession(c.session, new Date()));

    const active = await repo.listActiveByUser('user-1', new Date());
    expect(active.map((s) => s.id).sort()).toEqual([a.session.id, b.session.id].sort());
  });
});

describe('InMemoryAuditLogRepository', () => {
  it('appends and lists most recent first', async () => {
    const repo = new InMemoryAuditLogRepository();
    const first = {
      id: 'a1',
      actorId: 'user-1',
      action: 'first',
      resourceType: 'profile',
      safeSummary: {},
      createdAt: new Date('2026-01-01'),
    };
    const second = {
      id: 'a2',
      actorId: 'user-1',
      action: 'second',
      resourceType: 'profile',
      safeSummary: {},
      createdAt: new Date('2026-02-01'),
    };

    await repo.append(first);
    await repo.append(second);

    const logs = await repo.listByActor('user-1', 10);
    expect(logs.map((l) => l.action)).toEqual(['second', 'first']);
  });
});
