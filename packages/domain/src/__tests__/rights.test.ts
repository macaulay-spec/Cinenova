import { describe, expect, it } from 'vitest';
import { evaluateDownload, evaluateRights, type RightsEvaluationInput } from '../index';

const now = new Date('2026-08-01T12:00:00.000Z');

function baseInput(): RightsEvaluationInput {
  return {
    title: {
      titleId: 'title-1',
      kind: 'movie',
      maturityRating: 'PG_13',
      assetId: 'asset-1',
    },
    rights: [
      {
        id: 'right-1',
        titleId: 'title-1',
        territories: ['NG', 'GH', 'KE'],
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        endsAt: new Date('2027-01-01T00:00:00.000Z'),
        minimumPlan: 'standard',
        streamAllowed: true,
        offlineDownloadAllowed: false,
        permittedAssetIds: ['asset-1'],
      },
    ],
    entitlement: {
      userId: 'user-1',
      profileId: 'profile-1',
      plan: 'standard',
      active: true,
      concurrentStreamLimit: 2,
      offlineDeviceLimit: 1,
    },
    profile: {
      profileId: 'profile-1',
      maturityCeiling: 'R',
      pinProtected: false,
    },
    territory: 'NG',
    at: now,
    operation: 'stream',
  };
}

describe('evaluateRights', () => {
  it('allows active entitled playback inside territory, window, plan, and maturity policy', () => {
    const decision = evaluateRights(baseInput());
    expect(decision.allowed).toBe(true);
    expect(decision.denials).toEqual([]);
  });

  it('defaults to deny when no matching right exists', () => {
    const input = baseInput();
    const decision = evaluateRights({ ...input, rights: [] });
    expect(decision.allowed).toBe(false);
    expect(decision.denials.map((denial) => denial.code)).toContain('RIGHTS_NOT_FOUND');
  });

  it('denies profile maturity violations without exposing internal rules', () => {
    const input = baseInput();
    const decision = evaluateRights({
      ...input,
      profile: { ...input.profile, maturityCeiling: 'PG' },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.denials.map((denial) => denial.code)).toContain('PROFILE_RESTRICTED');
  });

  it('denies a lower subscription tier', () => {
    const input = baseInput();
    const decision = evaluateRights({
      ...input,
      entitlement: { ...input.entitlement, plan: 'free' },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.denials.map((denial) => denial.code)).toContain('PLAN_NOT_ALLOWED');
  });

  it('denies offline download unless explicitly allowed by rights', () => {
    const input = baseInput();
    const decision = evaluateDownload({
      ...input,
      operation: 'download',
      device: {
        deviceId: 'device-1',
        trusted: true,
        offlineRegistered: true,
        activeDownloadCount: 0,
      },
      activeOfflineDeviceCount: 1,
      maxDownloadsPerDevice: 10,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.denials.map((denial) => denial.code)).toContain('DOWNLOAD_NOT_ALLOWED');
  });
});
