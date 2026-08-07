import type {
  DbGateway,
  DbSessionRow,
  DbProfileRow,
  DbDeviceRow,
  DbAuditLogRow,
  DbUserRow,
} from './gateway';

/**
 * Minimal shape of the generated Prisma client that the CineNova adapters need.
 *
 * IMPORTANT: The real generated client (`@prisma/client` after `npx prisma
 * generate` from apps/web) structurally satisfies these signatures. This local
 * interface keeps the adapters type-checkable and testable without a generated
 * client. The row mappers bridge Prisma's column shape to the domain record
 * shape used by the repository ports.
 */

export interface PrismaDelegateLike {
  findUnique(args: { where: Record<string, unknown> }): Promise<unknown | null>;
  findMany(args: unknown): Promise<unknown[]>;
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: Record<string, unknown>; data: unknown }): Promise<unknown>;
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<unknown>;
  delete(args: { where: Record<string, unknown> }): Promise<unknown>;
  deleteMany(args: { where: Record<string, unknown> }): Promise<unknown>;
}

export interface PrismaLikeClient {
  session: PrismaDelegateLike;
  profile: PrismaDelegateLike;
  device: PrismaDelegateLike;
  auditLog: PrismaDelegateLike;
  user: PrismaDelegateLike;
}

function rowFromPrismaSession(raw: Record<string, unknown>): DbSessionRow {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    profileId: String(raw.profileId ?? raw.userId),
    deviceId: raw.deviceId ? String(raw.deviceId) : null,
    tokenHash: String(raw.tokenHash),
    createdAt: new Date(raw.createdAt as string),
    lastSeenAt: new Date((raw.lastSeenAt as string) ?? (raw.createdAt as string)),
    expiresAt: new Date(raw.expiresAt as string),
    revokedAt: raw.revokedAt ? new Date(raw.revokedAt as string) : null,
    userAgent: raw.userAgent ? String(raw.userAgent) : null,
    ip: raw.ip ? String(raw.ip) : null,
  };
}

function rowFromPrismaProfile(raw: Record<string, unknown>): DbProfileRow {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    name: String(raw.name),
    avatarInitial: String(raw.avatarInitial ?? String(raw.name).slice(0, 1)),
    type: (raw.type as DbProfileRow['type']) ?? 'adult',
    maturityCeiling: (raw.maturityCeiling as DbProfileRow['maturityCeiling']) ?? 'R',
    pinProtected: Boolean(raw.pinProtected),
    language: String(raw.language ?? 'en'),
    autoplay: Boolean(raw.autoplay ?? true),
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
  };
}

function rowFromPrismaDevice(raw: Record<string, unknown>): DbDeviceRow {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    name: String(raw.name),
    trusted: Boolean(raw.trusted),
    offlineRegistered: Boolean(raw.offlineRegistered),
    lastSeenAt: new Date((raw.lastSeenAt as string) ?? (raw.createdAt as string)),
    revoked: Boolean(raw.revoked ?? raw.revokedAt !== null),
  };
}

function rowFromPrismaAudit(raw: Record<string, unknown>): DbAuditLogRow {
  return {
    id: String(raw.id),
    actorId: String(raw.actorId),
    action: String(raw.action),
    resourceType: String(raw.resourceType),
    resourceId: raw.resourceId ? String(raw.resourceId) : null,
    safeSummary: (raw.safeSummary as Record<string, unknown>) ?? {},
    createdAt: new Date(raw.createdAt as string),
  };
}

function rowFromPrismaUser(raw: Record<string, unknown>): DbUserRow {
  return {
    id: String(raw.id),
    email: String(raw.email),
    displayName: String(raw.displayName ?? ''),
    roles: (raw.roles as string[]) ?? ['USER'],
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
  };
}

export function dbGatewayFromPrisma(prisma: PrismaLikeClient): DbGateway {
  return {
    session: {
      async create(data) {
        await prisma.session.create({ data });
      },
      async findByTokenHash(tokenHash) {
        const raw = await prisma.session.findUnique({ where: { tokenHash } });
        return raw ? rowFromPrismaSession(raw as Record<string, unknown>) : null;
      },
      async findById(id) {
        const raw = await prisma.session.findUnique({ where: { id } });
        return raw ? rowFromPrismaSession(raw as Record<string, unknown>) : null;
      },
      async listActiveByUser(userId, now) {
        const rows = await prisma.session.findMany({
          where: { userId, revokedAt: null, expiresAt: { gt: now } },
        });
        return rows.map((r) => rowFromPrismaSession(r as Record<string, unknown>));
      },
      async update(data) {
        await prisma.session.update({ where: { id: data.id }, data });
      },
      async revokeById(id, now) {
        await prisma.session.updateMany({ where: { id }, data: { revokedAt: now } });
      },
      async revokeAllForUser(userId, now) {
        await prisma.session.updateMany({ where: { userId }, data: { revokedAt: now } });
      },
    },
    profile: {
      async findById(id) {
        const raw = await prisma.profile.findUnique({ where: { id } });
        return raw ? rowFromPrismaProfile(raw as Record<string, unknown>) : null;
      },
      async listByUser(userId) {
        const rows = await prisma.profile.findMany({ where: { userId } });
        return rows.map((r) => rowFromPrismaProfile(r as Record<string, unknown>));
      },
      async create(data) {
        const raw = await prisma.profile.create({ data });
        return rowFromPrismaProfile(raw as Record<string, unknown>);
      },
      async update(data) {
        const raw = await prisma.profile.update({ where: { id: data.id }, data });
        return rowFromPrismaProfile(raw as Record<string, unknown>);
      },
      async deleteById(id) {
        await prisma.profile.delete({ where: { id } });
      },
    },
    device: {
      async findById(id) {
        const raw = await prisma.device.findUnique({ where: { id } });
        return raw ? rowFromPrismaDevice(raw as Record<string, unknown>) : null;
      },
      async listByUser(userId) {
        const rows = await prisma.device.findMany({ where: { userId } });
        return rows.map((r) => rowFromPrismaDevice(r as Record<string, unknown>));
      },
      async register(data) {
        const raw = await prisma.device.create({ data });
        return rowFromPrismaDevice(raw as Record<string, unknown>);
      },
      async update(data) {
        const raw = await prisma.device.update({ where: { id: data.id }, data });
        return rowFromPrismaDevice(raw as Record<string, unknown>);
      },
      async revokeById(id) {
        await prisma.device.updateMany({ where: { id }, data: { revokedAt: new Date() } });
      },
    },
    auditLog: {
      async append(data) {
        const raw = await prisma.auditLog.create({ data });
        return rowFromPrismaAudit(raw as Record<string, unknown>);
      },
      async listByActor(actorId, limit) {
        const rows = await prisma.auditLog.findMany({
          where: { actorId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        });
        return rows.map((r) => rowFromPrismaAudit(r as Record<string, unknown>));
      },
    },
    user: {
      async findById(id) {
        const raw = await prisma.user.findUnique({ where: { id } });
        return raw ? rowFromPrismaUser(raw as Record<string, unknown>) : null;
      },
      async findByEmail(email) {
        const raw = await prisma.user.findUnique({ where: { email } });
        return raw ? rowFromPrismaUser(raw as Record<string, unknown>) : null;
      },
      async create(data) {
        const raw = await prisma.user.create({ data });
        return rowFromPrismaUser(raw as Record<string, unknown>);
      },
      async update(data) {
        const raw = await prisma.user.update({ where: { id: data.id }, data });
        return rowFromPrismaUser(raw as Record<string, unknown>);
      },
    },
  };
}
