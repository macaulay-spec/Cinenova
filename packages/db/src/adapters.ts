import type {
  AuditLogRecord,
  AuditLogRepository,
  DeviceRecord,
  DeviceRepository,
  ProfileRecord,
  ProfileRepository,
  SessionRepository,
  UserRecord,
  UserRepository,
  SessionRecord,
} from '@cinenova/domain';
import type { DbGateway, DbProfileRow, DbDeviceRow, DbAuditLogRow, DbUserRow } from './gateway';
import {
  auditFromRow,
  deviceFromRow,
  profileFromRow,
  sessionFromRow,
  sessionToRow,
  userFromRow,
} from './gateway';

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly db: DbGateway) {}

  async create(session: SessionRecord): Promise<void> {
    await this.db.session.create(sessionToRow(session));
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const row = await this.db.session.findByTokenHash(tokenHash);
    return row ? sessionFromRow(row) : null;
  }

  async findById(id: string): Promise<SessionRecord | null> {
    const row = await this.db.session.findById(id);
    return row ? sessionFromRow(row) : null;
  }

  async listActiveByUser(userId: string, now: Date): Promise<SessionRecord[]> {
    const rows = await this.db.session.listActiveByUser(userId, now);
    return rows.map(sessionFromRow);
  }

  async update(session: SessionRecord): Promise<void> {
    await this.db.session.update(sessionToRow(session));
  }

  async revokeById(id: string, now: Date): Promise<void> {
    await this.db.session.revokeById(id, now);
  }

  async revokeAllForUser(userId: string, now: Date): Promise<void> {
    await this.db.session.revokeAllForUser(userId, now);
  }
}

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly db: DbGateway) {}

  async findById(id: string): Promise<ProfileRecord | null> {
    const row = await this.db.profile.findById(id);
    return row ? profileFromRow(row) : null;
  }

  async listByUser(userId: string): Promise<ProfileRecord[]> {
    const rows = await this.db.profile.listByUser(userId);
    return rows.map(profileFromRow);
  }

  async create(profile: ProfileRecord): Promise<ProfileRecord> {
    const row: DbProfileRow = {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      avatarInitial: profile.avatarInitial,
      type: profile.type,
      maturityCeiling: profile.maturityCeiling,
      pinProtected: profile.pinProtected,
      language: profile.language,
      autoplay: profile.autoplay,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    const saved = await this.db.profile.create(row);
    return profileFromRow(saved);
  }

  async update(profile: ProfileRecord): Promise<ProfileRecord> {
    const row: DbProfileRow = {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      avatarInitial: profile.avatarInitial,
      type: profile.type,
      maturityCeiling: profile.maturityCeiling,
      pinProtected: profile.pinProtected,
      language: profile.language,
      autoplay: profile.autoplay,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    const saved = await this.db.profile.update(row);
    return profileFromRow(saved);
  }

  async deleteById(id: string): Promise<void> {
    await this.db.profile.deleteById(id);
  }
}

export class PrismaDeviceRepository implements DeviceRepository {
  constructor(private readonly db: DbGateway) {}

  async findById(id: string): Promise<DeviceRecord | null> {
    const row = await this.db.device.findById(id);
    return row ? deviceFromRow(row) : null;
  }

  async listByUser(userId: string): Promise<DeviceRecord[]> {
    const rows = await this.db.device.listByUser(userId);
    return rows.map(deviceFromRow);
  }

  async register(device: DeviceRecord): Promise<DeviceRecord> {
    const row: DbDeviceRow = {
      id: device.id,
      userId: device.userId,
      name: device.name,
      trusted: device.trusted,
      offlineRegistered: device.offlineRegistered,
      lastSeenAt: device.lastSeenAt,
      revoked: device.revoked,
    };
    const saved = await this.db.device.register(row);
    return deviceFromRow(saved);
  }

  async update(device: DeviceRecord): Promise<DeviceRecord> {
    const row: DbDeviceRow = {
      id: device.id,
      userId: device.userId,
      name: device.name,
      trusted: device.trusted,
      offlineRegistered: device.offlineRegistered,
      lastSeenAt: device.lastSeenAt,
      revoked: device.revoked,
    };
    const saved = await this.db.device.update(row);
    return deviceFromRow(saved);
  }

  async revokeById(id: string): Promise<void> {
    await this.db.device.revokeById(id);
  }
}

export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly db: DbGateway) {}

  async append(entry: AuditLogRecord): Promise<AuditLogRecord> {
    const row: DbAuditLogRow = {
      id: entry.id,
      actorId: entry.actorId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      safeSummary: entry.safeSummary,
      createdAt: entry.createdAt,
    };
    const saved = await this.db.auditLog.append(row);
    return auditFromRow(saved);
  }

  async listByActor(actorId: string, limit: number): Promise<AuditLogRecord[]> {
    const rows = await this.db.auditLog.listByActor(actorId, limit);
    return rows.map(auditFromRow);
  }
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: DbGateway) {}

  async findById(id: string): Promise<UserRecord | null> {
    const row = await this.db.user.findById(id);
    return row ? userFromRow(row) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.db.user.findByEmail(email);
    return row ? userFromRow(row) : null;
  }

  async create(user: UserRecord): Promise<UserRecord> {
    const row: DbUserRow = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const saved = await this.db.user.create(row);
    return userFromRow(saved);
  }

  async update(user: UserRecord): Promise<UserRecord> {
    const row: DbUserRow = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const saved = await this.db.user.update(row);
    return userFromRow(saved);
  }
}
