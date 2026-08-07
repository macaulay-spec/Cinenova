import type { SessionRecord } from './session';

/**
 * Repository ports define the persistence boundary for CineNova identity and
 * session data. They are intentionally interface-only here: the domain and
 * application layers depend on these abstractions, not on any concrete
 * database. Adapters (in-memory, Prisma/PostgreSQL, etc.) implement them.
 *
 * Current status: an in-memory adapter is wired for local/demo operation.
 * A Prisma/PostgreSQL adapter is planned and will implement the same ports
 * without changing callers. The Prisma schema already exists.
 */

export interface SessionRepository {
  create(session: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  findById(id: string): Promise<SessionRecord | null>;
  listActiveByUser(userId: string, now: Date): Promise<SessionRecord[]>;
  update(session: SessionRecord): Promise<void>;
  revokeById(id: string, now: Date): Promise<void>;
  revokeAllForUser(userId: string, now: Date): Promise<void>;
}

export interface ProfileRecord {
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

export interface ProfileRepository {
  findById(id: string): Promise<ProfileRecord | null>;
  listByUser(userId: string): Promise<ProfileRecord[]>;
  create(profile: ProfileRecord): Promise<ProfileRecord>;
  update(profile: ProfileRecord): Promise<ProfileRecord>;
  deleteById(id: string): Promise<void>;
}

export interface DeviceRecord {
  id: string;
  userId: string;
  name: string;
  trusted: boolean;
  offlineRegistered: boolean;
  lastSeenAt: Date;
  revoked: boolean;
}

export interface DeviceRepository {
  findById(id: string): Promise<DeviceRecord | null>;
  listByUser(userId: string): Promise<DeviceRecord[]>;
  register(device: DeviceRecord): Promise<DeviceRecord>;
  update(device: DeviceRecord): Promise<DeviceRecord>;
  revokeById(id: string): Promise<void>;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  safeSummary: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLogRepository {
  append(entry: AuditLogRecord): Promise<AuditLogRecord>;
  listByActor(actorId: string, limit: number): Promise<AuditLogRecord[]>;
}

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(user: UserRecord): Promise<UserRecord>;
  update(user: UserRecord): Promise<UserRecord>;
}
