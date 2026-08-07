import { z } from 'zod';
import { isoDateSchema, uuidSchema } from './common';

export const sessionRecordSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  profileId: uuidSchema,
  deviceId: uuidSchema,
  createdAt: isoDateSchema,
  lastSeenAt: isoDateSchema,
  expiresAt: isoDateSchema,
  revokedAt: isoDateSchema.nullable(),
});

export const sessionIssueResponseSchema = z.object({
  token: z.string().min(1),
  session: sessionRecordSchema,
  csrfToken: z.string().min(1),
});

export const csrfTokenResponseSchema = z.object({
  token: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
});

export type SessionRecordDto = z.infer<typeof sessionRecordSchema>;
export type SessionIssueResponse = z.infer<typeof sessionIssueResponseSchema>;
export type CsrfTokenResponse = z.infer<typeof csrfTokenResponseSchema>;
