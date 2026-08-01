import type { EntitlementSnapshot, ProfilePolicyContext, Role } from '@cinenova/domain';

export interface LocalPrincipal {
  userId: string;
  profile: ProfilePolicyContext;
  entitlement: EntitlementSnapshot;
  roles: Role[];
}

export function getLocalPrincipal(): LocalPrincipal {
  return {
    userId: 'local-user',
    profile: {
      profileId: 'local-profile',
      maturityCeiling: 'R',
      pinProtected: false,
      preferredAudioLanguage: 'en',
      preferredSubtitleLanguage: 'en',
    },
    entitlement: {
      userId: 'local-user',
      profileId: 'local-profile',
      plan: 'standard',
      active: true,
      concurrentStreamLimit: 2,
      offlineDeviceLimit: 1,
    },
    roles: ['USER'],
  };
}
