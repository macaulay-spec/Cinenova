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
} from '../ports';
import type { SessionRecord } from '../session';

/**
 * In-memory implementations of the CineNova repository ports.
 *
 * These are reference adapters for local/demo operation and for tests. They are
 * explicitly not durable and are not intended for production: production is
 * expected to use a PostgreSQL-backed adapter implementing the same ports.
 */

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly byTokenHash = new Map<string, SessionRecord>();

  async create(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
    this.byTokenHash.set(session.tokenHash, session);
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return this.byTokenHash.get(tokenHash) ?? null;
  }

  async findById(id: string): Promise<SessionRecord | null> {
    return this.sessions.get(id) ?? null;
  }

  async listActiveByUser(userId: string, now: Date): Promise<SessionRecord[]> {
    const active: SessionRecord[] = [];
    for (const session of this.sessions.values()) {
      if (
        session.userId === userId &&
        session.revokedAt === null &&
        now.getTime() < session.expiresAt.getTime()
      ) {
        active.push(session);
      }
    }
    return active;
  }

  async update(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
    this.byTokenHash.set(session.tokenHash, session);
  }

  async revokeById(id: string, now: Date): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      const revoked = { ...session, revokedAt: now };
      this.sessions.set(id, revoked);
      this.byTokenHash.set(revoked.tokenHash, revoked);
    }
  }

  async revokeAllForUser(userId: string, now: Date): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        const revoked = { ...session, revokedAt: now };
        this.sessions.set(id, revoked);
        this.byTokenHash.set(revoked.tokenHash, revoked);
      }
    }
  }
}

export class InMemoryProfileRepository implements ProfileRepository {
  private readonly profiles = new Map<string, ProfileRecord>();

  async findById(id: string): Promise<ProfileRecord | null> {
    return this.profiles.get(id) ?? null;
  }

  async listByUser(userId: string): Promise<ProfileRecord[]> {
    return [...this.profiles.values()].filter((profile) => profile.userId === userId);
  }

  async create(profile: ProfileRecord): Promise<ProfileRecord> {
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async update(profile: ProfileRecord): Promise<ProfileRecord> {
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async deleteById(id: string): Promise<void> {
    this.profiles.delete(id);
  }
}

export class InMemoryDeviceRepository implements DeviceRepository {
  private readonly devices = new Map<string, DeviceRecord>();

  async findById(id: string): Promise<DeviceRecord | null> {
    return this.devices.get(id) ?? null;
  }

  async listByUser(userId: string): Promise<DeviceRecord[]> {
    return [...this.devices.values()].filter((device) => device.userId === userId);
  }

  async register(device: DeviceRecord): Promise<DeviceRecord> {
    this.devices.set(device.id, device);
    return device;
  }

  async update(device: DeviceRecord): Promise<DeviceRecord> {
    this.devices.set(device.id, device);
    return device;
  }

  async revokeById(id: string): Promise<void> {
    const device = this.devices.get(id);
    if (device) {
      this.devices.set(id, { ...device, revoked: true });
    }
  }
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
  private readonly logs: AuditLogRecord[] = [];

  async append(entry: AuditLogRecord): Promise<AuditLogRecord> {
    this.logs.unshift(entry);
    return entry;
  }

  async listByActor(actorId: string, limit: number): Promise<AuditLogRecord[]> {
    return this.logs.filter((entry) => entry.actorId === actorId).slice(0, limit);
  }
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();
  private readonly byEmail = new Map<string, UserRecord>();

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.byEmail.get(email.toLowerCase()) ?? null;
  }

  async create(user: UserRecord): Promise<UserRecord> {
    this.users.set(user.id, user);
    this.byEmail.set(user.email.toLowerCase(), user);
    return user;
  }

  async update(user: UserRecord): Promise<UserRecord> {
    this.users.set(user.id, user);
    this.byEmail.set(user.email.toLowerCase(), user);
    return user;
  }
}
