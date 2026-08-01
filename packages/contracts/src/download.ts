import { z } from 'zod';
import { isoDateSchema, uuidSchema } from './common';

export const createDownloadRequestSchema = z.object({
  titleId: uuidSchema,
  assetId: uuidSchema.optional(),
  profileId: uuidSchema,
  deviceId: uuidSchema,
  territory: z.string().length(2),
  idempotencyKey: z.string().min(16).max(128),
});

export const downloadRecordSchema = z.object({
  id: uuidSchema,
  titleId: uuidSchema,
  profileId: uuidSchema,
  deviceId: uuidSchema,
  status: z.enum(['requested', 'authorized', 'unavailable', 'expired', 'revoked']),
  expiresAt: isoDateSchema.nullable(),
  message: z.string(),
});

export type CreateDownloadRequest = z.infer<typeof createDownloadRequestSchema>;
export type DownloadRecord = z.infer<typeof downloadRecordSchema>;
