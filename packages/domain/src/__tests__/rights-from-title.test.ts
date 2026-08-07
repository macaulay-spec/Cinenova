import { describe, expect, it } from 'vitest';
import { evaluateRights } from '../policies/rights';
import { rightsFromTitle } from '../policies/rights-from-title';

const title = {
  id: 'gz-s1',
  availableFrom: '2026-01-01T00:00:00.000Z',
  availableUntil: '2028-01-01T00:00:00.000Z',
  minimumPlan: 'standard' as const,
  countries: ['NG', 'GH'],
  offlineDownloadAllowed: false,
  primaryAssetId: 'gz-s1-asset',
};

describe('rightsFromTitle', () => {
  it('derives a ContentRight from a normalized title', () => {
    const right = rightsFromTitle(title);
    expect(right.titleId).toBe('gz-s1');
    expect(right.territories).toEqual(['NG', 'GH']);
    expect(right.streamAllowed).toBe(true);
    expect(right.offlineDownloadAllowed).toBe(false);
    expect(right.permittedAssetIds).toContain('gz-s1-asset');
  });

  it('allows streaming for a standard plan in an allowed territory', () => {
    const right = rightsFromTitle(title);
    const decision = evaluateRights({
      title: { titleId: 'gz-s1', kind: 'movie', maturityRating: 'PG', assetId: 'gz-s1-asset' },
      rights: [right],
      entitlement: {
        userId: 'u',
        profileId: 'p',
        plan: 'standard',
        active: true,
        concurrentStreamLimit: 2,
        offlineDeviceLimit: 1,
      },
      profile: { profileId: 'p', maturityCeiling: 'PG', pinProtected: false },
      territory: 'NG',
      at: new Date('2026-06-01T00:00:00.000Z'),
      operation: 'stream',
    });
    expect(decision.allowed).toBe(true);
  });
});
