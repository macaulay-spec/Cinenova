export type UUID = string;
export type ISODateString = string;

export type PlanCode = 'guest' | 'free' | 'standard' | 'premium' | 'admin';

export const PLAN_RANK: Record<PlanCode, number> = {
  guest: 0,
  free: 1,
  standard: 2,
  premium: 3,
  admin: 99,
};

export type MaturityRating = 'G' | 'PG' | 'PG_13' | 'R' | 'NC_17';

export const MATURITY_RANK: Record<MaturityRating, number> = {
  G: 0,
  PG: 1,
  PG_13: 2,
  R: 3,
  NC_17: 4,
};

export type TitleKind = 'movie' | 'series' | 'episode' | 'trailer';

export interface ContentRight {
  id: UUID;
  titleId: UUID;
  territories: string[];
  startsAt: Date;
  endsAt: Date;
  minimumPlan: PlanCode;
  streamAllowed: boolean;
  offlineDownloadAllowed: boolean;
  permittedAssetIds: UUID[];
}

export interface EntitlementSnapshot {
  userId: UUID;
  profileId: UUID;
  plan: PlanCode;
  active: boolean;
  graceUntil?: Date;
  concurrentStreamLimit: number;
  offlineDeviceLimit: number;
}

export interface ProfilePolicyContext {
  profileId: UUID;
  maturityCeiling: MaturityRating;
  pinProtected: boolean;
  preferredAudioLanguage?: string;
  preferredSubtitleLanguage?: string;
}

export interface TitlePolicyContext {
  titleId: UUID;
  kind: TitleKind;
  maturityRating: MaturityRating;
  assetId: UUID;
}

export interface RightsEvaluationInput {
  title: TitlePolicyContext;
  rights: ContentRight[];
  entitlement: EntitlementSnapshot;
  profile: ProfilePolicyContext;
  territory: string;
  at: Date;
  operation: 'stream' | 'download';
}

export type PolicyReasonCode =
  | 'ENTITLEMENT_INACTIVE'
  | 'PLAN_NOT_ALLOWED'
  | 'RIGHTS_NOT_FOUND'
  | 'RIGHTS_WINDOW_CLOSED'
  | 'TERRITORY_NOT_ALLOWED'
  | 'STREAM_NOT_ALLOWED'
  | 'DOWNLOAD_NOT_ALLOWED'
  | 'ASSET_NOT_ALLOWED'
  | 'PROFILE_RESTRICTED';

export interface PolicyDenial {
  code: PolicyReasonCode;
  message: string;
}

export interface PolicyDecision {
  allowed: boolean;
  denials: PolicyDenial[];
  matchedRight?: ContentRight;
}

export type Permission =
  | 'catalogue:read'
  | 'catalogue:write'
  | 'rights:read'
  | 'rights:write'
  | 'editorial:publish'
  | 'users:read'
  | 'users:support'
  | 'admin:read'
  | 'admin:write'
  | 'audit:read'
  | 'playback:create'
  | 'download:create'
  | 'billing:manage';

export type Role = 'USER' | 'SUPPORT' | 'EDITOR' | 'RIGHTS_MANAGER' | 'ADMIN' | 'OWNER';

export interface DevicePolicyContext {
  deviceId: UUID;
  trusted: boolean;
  offlineRegistered: boolean;
  activeDownloadCount: number;
}
