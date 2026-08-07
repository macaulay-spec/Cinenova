import type { AuditLogEntry } from '@cinenova/contracts';

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-identity-foundation',
    actorId: 'local-user',
    action: 'identity.profile.foundation.created',
    resourceType: 'profile',
    resourceId: 'local-profile-adult',
    safeSummary: {
      milestone: 'identity-profile-rbac-foundation',
      persisted: false,
      note: 'Mock audited event until PostgreSQL-backed audit writer is connected.',
    },
    createdAt: new Date('2026-08-01T03:35:00.000Z').toISOString(),
  },
  {
    id: 'audit-rights-policy-default-deny',
    actorId: 'local-user',
    action: 'rights.policy.default_deny.enabled',
    resourceType: 'policy',
    resourceId: 'rights-evaluator',
    safeSummary: {
      playback: 'server-side rights check required',
      download: 'explicit offline rights required',
    },
    createdAt: new Date('2026-08-01T03:36:00.000Z').toISOString(),
  },
];

export function recordAuditPlaceholder(
  action: string,
  resourceType: string,
  resourceId: string,
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}`,
    actorId: 'local-user',
    action,
    resourceType,
    resourceId,
    safeSummary: {
      persisted: false,
      note: 'This event is returned to the caller but is not persisted until the database writer is connected.',
    },
    createdAt: new Date().toISOString(),
  };
}
