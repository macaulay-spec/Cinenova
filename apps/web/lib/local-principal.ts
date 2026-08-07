import { cookies } from 'next/headers';
import {
  permissionsForRoles,
  type EntitlementSnapshot,
  type MaturityRating,
  type ProfilePolicyContext,
  type Role,
} from '@cinenova/domain';
import { principalSchema, type DeviceDto, type PrincipalDto, type ProfileDto } from '@cinenova/contracts';

export const ACTIVE_PROFILE_COOKIE = 'cinenova_active_profile';

export interface LocalPrincipal {
  userId: string;
  email: string;
  displayName: string;
  profile: ProfilePolicyContext;
  entitlement: EntitlementSnapshot;
  roles: Role[];
}

export const DEMO_PROFILES: ProfileDto[] = [
  {
    id: 'local-profile-adult',
    name: 'Adult',
    avatarInitial: 'A',
    type: 'adult',
    maturityCeiling: 'R',
    pinProtected: false,
    language: 'en',
    autoplay: true,
    active: false,
  },
  {
    id: 'local-profile-teen',
    name: 'Teen',
    avatarInitial: 'T',
    type: 'teen',
    maturityCeiling: 'PG_13',
    pinProtected: true,
    language: 'en',
    autoplay: true,
    active: false,
  },
  {
    id: 'local-profile-kids',
    name: 'Kids',
    avatarInitial: 'K',
    type: 'child',
    maturityCeiling: 'PG',
    pinProtected: true,
    language: 'en',
    autoplay: false,
    active: false,
  },
];

export const DEMO_DEVICES: DeviceDto[] = [
  {
    id: 'local-browser',
    name: 'This browser',
    trusted: true,
    offlineRegistered: false,
    lastSeenAt: new Date('2026-08-01T03:00:00.000Z').toISOString(),
    revoked: false,
  },
  {
    id: 'living-room-tv',
    name: 'Living room TV',
    trusted: true,
    offlineRegistered: false,
    lastSeenAt: new Date('2026-07-30T21:15:00.000Z').toISOString(),
    revoked: false,
  },
];

function profileToPolicyContext(profile: ProfileDto): ProfilePolicyContext {
  return {
    profileId: profile.id,
    maturityCeiling: profile.maturityCeiling as MaturityRating,
    pinProtected: profile.pinProtected,
    preferredAudioLanguage: profile.language,
    preferredSubtitleLanguage: profile.language,
  };
}

export function getProfileById(profileId: string): ProfileDto | undefined {
  return DEMO_PROFILES.find((profile) => profile.id === profileId);
}

export function resolvePrincipalForProfile(profileId: string): LocalPrincipal {
  const activeProfile = getProfileById(profileId) ?? DEMO_PROFILES[0]!;

  return {
    userId: 'local-user',
    email: 'demo@cinenova.local',
    displayName: 'CineNova Demo',
    profile: profileToPolicyContext(activeProfile),
    entitlement: {
      userId: 'local-user',
      profileId: activeProfile.id,
      plan: 'standard',
      active: true,
      concurrentStreamLimit: 2,
      offlineDeviceLimit: 1,
    },
    roles: ['USER'],
  };
}

export async function getActiveProfileId(): Promise<string> {
  const cookieStore = await cookies();
  const cookieProfileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;
  return getProfileById(cookieProfileId ?? '')?.id ?? DEMO_PROFILES[0]!.id;
}

export async function getLocalPrincipal(): Promise<LocalPrincipal> {
  return resolvePrincipalForProfile(await getActiveProfileId());
}

export async function getPrincipalDto(): Promise<PrincipalDto> {
  const principal = await getLocalPrincipal();
  const activeProfileId = principal.profile.profileId;
  const permissions = [...permissionsForRoles(principal.roles)];

  return principalSchema.parse({
    user: {
      id: principal.userId,
      email: principal.email,
      displayName: principal.displayName,
      roles: principal.roles,
      permissions,
    },
    activeProfile: {
      ...getProfileById(activeProfileId)!,
      active: true,
    },
    profiles: DEMO_PROFILES.map((profile) => ({ ...profile, active: profile.id === activeProfileId })),
    devices: DEMO_DEVICES,
    entitlement: {
      plan: principal.entitlement.plan,
      active: principal.entitlement.active,
      concurrentStreamLimit: principal.entitlement.concurrentStreamLimit,
      offlineDeviceLimit: principal.entitlement.offlineDeviceLimit,
    },
  });
}
