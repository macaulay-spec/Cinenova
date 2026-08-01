import { z } from 'zod';
import { isoDateSchema, uuidSchema } from './common';
import { trackSchema } from './catalogue';

export const createPlaybackSessionRequestSchema = z.object({
  titleId: uuidSchema,
  assetId: uuidSchema.optional(),
  profileId: uuidSchema.default('local-profile'),
  deviceId: uuidSchema.default('local-browser'),
  territory: z.string().length(2).default('NG'),
});

export const playbackSourceSchema = z.object({
  sessionId: uuidSchema,
  playbackUrl: z.string().url().or(z.string().startsWith('/')),
  sourceType: z.enum(['mp4', 'hls', 'dash']),
  expiresAt: isoDateSchema,
  drmActive: z.boolean(),
  drmScheme: z.enum(['none', 'widevine', 'fairplay', 'playready']).default('none'),
  captions: z.array(trackSchema),
  audio: z.array(trackSchema),
  heartbeatIntervalSeconds: z.number().int().min(10).max(60),
  policy: z.object({
    offlineDownloadAllowed: z.boolean(),
    concurrentStreamLimit: z.number().int().positive(),
    signedSourceUrlExposed: z.literal(false),
  }),
});

export const playbackProgressRequestSchema = z.object({
  sessionId: uuidSchema,
  positionSeconds: z.number().min(0),
  durationSeconds: z.number().positive(),
  completed: z.boolean().default(false),
});

export type CreatePlaybackSessionRequest = z.infer<typeof createPlaybackSessionRequestSchema>;
export type PlaybackSource = z.infer<typeof playbackSourceSchema>;
