import { describe, expect, it } from 'vitest';
import {
  PrismaSessionRepository,
  PrismaProfileRepository,
  PrismaAuditLogRepository,
} from '../adapters';
import type { DbGateway, DbSessionRow } from '../gateway';
import { dbGatewayFromPrisma, type PrismaLikeClient } from '../prisma-client';
import { issueSession } from '@cinenova/domain';

function fakeDbGateway(): DbGateway {
  const sessions = new Map<string, DbSessionRow>();
  return {
    session: {
      async create(data) {
        sessions.set(data.id, data);
      },
      async findByTokenHash(tokenHash) {
        for (const row of sessions.values()) {
          if (row.tokenHash === tokenHash) return row;
        }
        return null;
      },
      async findById(id) {
        return sessions.get(id) ?? null;
      },
      async listActiveByUser(userId, now) {
        return [...sessions.values()].filter(
          (s) =>
            s.userId === userId && s.revokedAt === null && now.getTime() < s.expiresAt.getTime(),
        );
      },
      async update(data) {
        sessions.set(data.id, data);
      },
      async revokeById(id, now) {
        const s = sessions.get(id);
        if (s) sessions.set(id, { ...s, revokedAt: now });
      },
      async revokeAllForUser(userId, now) {
        for (const [id, s] of sessions) {
          if (s.userId === userId) sessions.set(id, { ...s, revokedAt: now });
        }
      },
    },
    profile: {
      async findById() {
        return null;
      },
      async listByUser() {
        return [];
      },
      async create(data) {
        return data;
      },
      async update(data) {
        return data;
      },
      async deleteById() {},
    },
    device: {
      async findById() {
        return null;
      },
      async listByUser() {
        return [];
      },
      async register(data) {
        return data;
      },
      async update(data) {
        return data;
      },
      async revokeById() {},
    },
    auditLog: {
      async append(data) {
        return data;
      },
      async listByActor() {
        return [];
      },
    },
    user: {
      async findById() {
        return null;
      },
      async findByEmail() {
        return null;
      },
      async create(data) {
        return data;
      },
      async update(data) {
        return data;
      },
    },
  };
}

describe('PrismaSessionRepository', () => {
  it('stores and resolves a session by token hash', async () => {
    const repo = new PrismaSessionRepository(fakeDbGateway());
    const issued = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd' });
    await repo.create(issued.session);
    const found = await repo.findByTokenHash(issued.session.tokenHash);
    expect(found?.id).toBe(issued.session.id);
  });

  it('revokes a session', async () => {
    const repo = new PrismaSessionRepository(fakeDbGateway());
    const issued = issueSession({ userId: 'u', profileId: 'p', deviceId: 'd' });
    await repo.create(issued.session);
    await repo.revokeById(issued.session.id, new Date());
    const found = await repo.findById(issued.session.id);
    expect(found?.revokedAt).not.toBeNull();
  });
});

describe('PrismaProfileRepository and audit', () => {
  it('creates a profile via the gateway', async () => {
    const repo = new PrismaProfileRepository(fakeDbGateway());
    const saved = await repo.create({
      id: 'p1',
      userId: 'u1',
      name: 'Kids',
      avatarInitial: 'K',
      type: 'child',
      maturityCeiling: 'PG',
      pinProtected: true,
      language: 'en',
      autoplay: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(saved.name).toBe('Kids');
  });

  it('appends an audit entry via the gateway', async () => {
    const repo = new PrismaAuditLogRepository(fakeDbGateway());
    const saved = await repo.append({
      id: 'a1',
      actorId: 'u1',
      action: 'profile.create',
      resourceType: 'profile',
      safeSummary: { persisted: true },
      createdAt: new Date(),
    });
    expect(saved.action).toBe('profile.create');
  });
});

describe('dbGatewayFromPrisma', () => {
  it('adapts a Prisma-like client into a DbGateway', async () => {
    const fakePrisma: PrismaLikeClient = {
      session: {
        async findUnique({ where }) {
          const tokenHash = where.tokenHash as string;
          return tokenHash === 'abc' ? { id: 's1', tokenHash } : null;
        },
        async findMany() {
          return [];
        },
        async create() {
          return { id: 's1' };
        },
        async update() {
          return { id: 's1' };
        },
        async updateMany() {
          return {};
        },
        async delete() {
          return { id: 's1' };
        },
        async deleteMany() {
          return {};
        },
      },
      profile: {
        async findUnique() {
          return null;
        },
        async findMany() {
          return [];
        },
        async create() {
          return { id: 'p1' };
        },
        async update() {
          return { id: 'p1' };
        },
        async updateMany() {
          return {};
        },
        async delete() {
          return { id: 'p1' };
        },
        async deleteMany() {
          return {};
        },
      },
      device: {
        async findUnique() {
          return null;
        },
        async findMany() {
          return [];
        },
        async create() {
          return { id: 'd1' };
        },
        async update() {
          return { id: 'd1' };
        },
        async updateMany() {
          return {};
        },
        async delete() {
          return { id: 'd1' };
        },
        async deleteMany() {
          return {};
        },
      },
      auditLog: {
        async findUnique() {
          return null;
        },
        async findMany() {
          return [];
        },
        async create() {
          return { id: 'a1' };
        },
        async update() {
          return { id: 'a1' };
        },
        async updateMany() {
          return {};
        },
        async delete() {
          return { id: 'a1' };
        },
        async deleteMany() {
          return {};
        },
      },
      user: {
        async findUnique() {
          return null;
        },
        async findMany() {
          return [];
        },
        async create() {
          return { id: 'u1' };
        },
        async update() {
          return { id: 'u1' };
        },
        async updateMany() {
          return {};
        },
        async delete() {
          return { id: 'u1' };
        },
        async deleteMany() {
          return {};
        },
      },
    };

    const gateway = dbGatewayFromPrisma(fakePrisma);
    const found = await gateway.session.findByTokenHash('abc');
    expect(found?.id).toBe('s1');
  });
});
