import { z } from 'zod';
import { isoDateSchema, uuidSchema } from './common';

export const auditLogEntrySchema = z.object({
  id: uuidSchema,
  actorId: uuidSchema,
  action: z.string().min(1),
  resourceType: z.string().min(1),
  resourceId: uuidSchema.optional(),
  safeSummary: z.record(z.string(), z.unknown()),
  createdAt: isoDateSchema,
});

export const providerHealthSchema = z.object({
  provider: z.string().min(1),
  status: z.enum(['disabled', 'healthy', 'degraded', 'unhealthy']),
  latencyMs: z.number().nonnegative().nullable(),
  lastCheckedAt: isoDateSchema,
  message: z.string(),
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
export type ProviderHealth = z.infer<typeof providerHealthSchema>;
