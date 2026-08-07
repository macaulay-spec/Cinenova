import type { SessionRecord } from '@cinenova/domain';
import type { ProfileRecord, DeviceRecord, AuditLogRecord, UserRecord } from '@cinenova/domain';

/**
 * Minimal database gateway abstraction for the CineNova repository adapters.
 *
 * This mirrors the subset of Prisma model accessors that the adapters use. It
 * is intentionally interface-only here so the adapters typecheck and run in
 * tests without a generated Prisma client. The real implementation (`prisma`
 * client) structurally satisfies this interface after `prisma generate`.
 *
 * When a raw row differs from the domain record, `toDomain`/`toDb` helpers
 * translate the shape. See each adapter below.
 */

export interface DbSessionRow {
  id: string;
  userId: string;
  profileId: string;
  deviceId: string | null;
  tokenHash: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ip: string | null;
}

export interface DbProfileRow {
  id: string;
  userId: string;
  name: string;
  avatarInitial: string;
  type: 'adult' | 'teen' | 'child';
  maturityCeiling: 'G' | 'PG' | 'PG_13' | 'R' | 'NC_17';
  pinProtected: boolean;
  language: string;
  autoplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbDeviceRow {
  id: string;
  userId: string;
  name: string;
  trusted: boolean;
  offlineRegistered: boolean;
  lastSeenAt: Date;
  revoked: boolean;
}

export interface DbAuditLogRow {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  safeSummary: Record<string, unknown>;
  createdAt: Date;
}

export interface DbUserRow {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSessionGateway {
  create(data: DbSessionRow): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<DbSessionRow | null>;
  findById(id: string): Promise<DbSessionRow | null>;
  listActiveByUser(userId: string, now: Date): Promise<DbSessionRow[]>;
  update(data: DbSessionRow): Promise<void>;
  revokeById(id: string, now: Date): Promise<void>;
  revokeAllForUser(userId: string, now: Date): Promise<void>;
}

export interface DbProfileGateway {
  findById(id: string): Promise<DbProfileRow | null>;
  listByUser(userId: string): Promise<DbProfileRow[]>;
  create(data: DbProfileRow): Promise<DbProfileRow>;
  update(data: DbProfileRow): Promise<DbProfileRow>;
  deleteById(id: string): Promise<void>;
}

export interface DbDeviceGateway {
  findById(id: string): Promise<DbDeviceRow | null>;
  listByUser(userId: string): Promise<DbDeviceRow[]>;
  register(data: DbDeviceRow): Promise<DbDeviceRow>;
  update(data: DbDeviceRow): Promise<DbDeviceRow>;
  revokeById(id: string): Promise<void>;
}

export interface DbAuditLogGateway {
  append(data: DbAuditLogRow): Promise<DbAuditLogRow>;
  listByActor(actorId: string, limit: number): Promise<DbAuditLogRow[]>;
}

export interface DbUserGateway {
  findById(id: string): Promise<DbUserRow | null>;
  findByEmail(email: string): Promise<DbUserRow | null>;
  create(data: DbUserRow): Promise<DbUserRow>;
  update(data: DbUserRow): Promise<DbUserRow>;
}

export interface DbGateway {
  session: DbSessionGateway;
  profile: DbProfileGateway;
  device: DbDeviceGateway;
  auditLog: DbAuditLogGateway;
  user: DbUserGateway;
}

// Domain record translation helpers -----------------------------------------------------------

export function sessionFromRow(row: DbSessionRow): SessionRecord {
  return {
    id: row.id,
    userId: row.userId,
    profileId: row.profileId,
    deviceId: row.deviceId ?? '',
    tokenHash: row.tokenHash,
    createdAt: row.createdAt,
    lastSeenAt: row.lastSeenAt,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    userAgent: row.userAgent,
    ip: row.ip,
  };
}

export function sessionToRow(session: SessionRecord): DbSessionRow {
  return {
    id: session.id,
    userId: session.userId,
    profileId: session.profileId,
    deviceId: session.deviceId || null,
    tokenHash: session.tokenHash,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    userAgent: session.userAgent,
    ip: session.ip,
  };
}

export function profileFromRow(row: DbProfileRow): ProfileRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    avatarInitial: row.avatarInitial,
    type: row.type,
    maturityCeiling: row.maturityCeiling,
    pinProtected: row.pinProtected,
    language: row.language,
    autoplay: row.autoplay,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function deviceFromRow(row: DbDeviceRow): DeviceRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    trusted: row.trusted,
    offlineRegistered: row.offlineRegistered,
    lastSeenAt: row.lastSeenAt,
    revoked: row.revoked,
  };
}

export function auditFromRow(row: DbAuditLogRow): AuditLogRecord {
  return {
    id: row.id,
    actorId: row.actorId,
    action: row.action,
    resourceType: row.resourceType,
    ...(row.resourceId ? { resourceId: row.resourceId } : {}),
    safeSummary: row.safeSummary,
    createdAt: row.createdAt,
  };
}

export function userFromRow(row: DbUserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    roles: row.roles,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
