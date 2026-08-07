import { z } from 'zod';
import { isoDateSchema, maturityRatingSchema, planCodeSchema, uuidSchema } from './common';

export const roleSchema = z.enum(['USER', 'SUPPORT', 'EDITOR', 'RIGHTS_MANAGER', 'ADMIN', 'OWNER']);

export const permissionSchema = z.enum([
  'catalogue:read',
  'catalogue:write',
  'rights:read',
  'rights:write',
  'editorial:publish',
  'users:read',
  'users:support',
  'admin:read',
  'admin:write',
  'audit:read',
  'playback:create',
  'download:create',
  'billing:manage',
]);

export const profileSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(80),
  avatarInitial: z.string().min(1).max(2),
  type: z.enum(['adult', 'teen', 'child']),
  maturityCeiling: maturityRatingSchema,
  pinProtected: z.boolean(),
  language: z.string().min(2).max(16),
  autoplay: z.boolean(),
  active: z.boolean().default(false),
});

export const deviceSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(120),
  trusted: z.boolean(),
  offlineRegistered: z.boolean(),
  lastSeenAt: isoDateSchema,
  revoked: z.boolean(),
});

export const entitlementSummarySchema = z.object({
  plan: planCodeSchema,
  active: z.boolean(),
  concurrentStreamLimit: z.number().int().positive(),
  offlineDeviceLimit: z.number().int().nonnegative(),
  graceUntil: isoDateSchema.optional(),
});

export const principalSchema = z.object({
  user: z.object({
    id: uuidSchema,
    email: z.string().email(),
    displayName: z.string().min(1),
    roles: z.array(roleSchema),
    permissions: z.array(permissionSchema),
  }),
  activeProfile: profileSchema,
  profiles: z.array(profileSchema),
  devices: z.array(deviceSchema),
  entitlement: entitlementSummarySchema,
});

export const createProfileRequestSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(['adult', 'teen', 'child']).default('adult'),
  maturityCeiling: maturityRatingSchema,
  pin: z.string().min(4).max(12).optional(),
});

export const switchProfileRequestSchema = z.object({
  profileId: uuidSchema,
  returnTo: z.string().startsWith('/').default('/'),
});

export const sessionStatusSchema = z.object({
  authenticated: z.boolean(),
  profileId: uuidSchema,
  expiresAt: isoDateSchema,
  csrfRequired: z.boolean(),
});

export type RoleDto = z.infer<typeof roleSchema>;
export type PermissionDto = z.infer<typeof permissionSchema>;
export type ProfileDto = z.infer<typeof profileSchema>;
export type DeviceDto = z.infer<typeof deviceSchema>;
export type PrincipalDto = z.infer<typeof principalSchema>;
export type CreateProfileRequest = z.infer<typeof createProfileRequestSchema>;
export type SwitchProfileRequest = z.infer<typeof switchProfileRequestSchema>;
export type SessionStatus = z.infer<typeof sessionStatusSchema>;
