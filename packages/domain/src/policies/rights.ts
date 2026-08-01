import {
  MATURITY_RANK,
  PLAN_RANK,
  type ContentRight,
  type PolicyDecision,
  type PolicyDenial,
  type RightsEvaluationInput,
} from '../types';

function normalizeTerritory(territory: string): string {
  return territory.trim().toUpperCase();
}

function isInsideWindow(right: ContentRight, at: Date): boolean {
  return right.startsAt.getTime() <= at.getTime() && at.getTime() <= right.endsAt.getTime();
}

function isTerritoryAllowed(right: ContentRight, territory: string): boolean {
  const normalized = normalizeTerritory(territory);
  return right.territories.map(normalizeTerritory).includes(normalized);
}

function selectCandidateRight(input: RightsEvaluationInput): ContentRight | undefined {
  return input.rights.find((right) => right.titleId === input.title.titleId);
}

export function evaluateRights(input: RightsEvaluationInput): PolicyDecision {
  const denials: PolicyDenial[] = [];

  if (!input.entitlement.active) {
    denials.push({
      code: 'ENTITLEMENT_INACTIVE',
      message: 'Your subscription is not active for this action.',
    });
  }

  if (MATURITY_RANK[input.title.maturityRating] > MATURITY_RANK[input.profile.maturityCeiling]) {
    denials.push({
      code: 'PROFILE_RESTRICTED',
      message: 'This title exceeds the active profile maturity limit.',
    });
  }

  const right = selectCandidateRight(input);
  if (!right) {
    denials.push({
      code: 'RIGHTS_NOT_FOUND',
      message: 'This title is not currently licensed for this action.',
    });
    return { allowed: false, denials };
  }

  if (!isInsideWindow(right, input.at)) {
    denials.push({
      code: 'RIGHTS_WINDOW_CLOSED',
      message: 'This title is outside its licensed availability window.',
    });
  }

  if (!isTerritoryAllowed(right, input.territory)) {
    denials.push({
      code: 'TERRITORY_NOT_ALLOWED',
      message: 'This title is not available in your current territory.',
    });
  }

  if (PLAN_RANK[input.entitlement.plan] < PLAN_RANK[right.minimumPlan]) {
    denials.push({
      code: 'PLAN_NOT_ALLOWED',
      message: 'Your current plan does not include this title.',
    });
  }

  if (!right.permittedAssetIds.includes(input.title.assetId)) {
    denials.push({
      code: 'ASSET_NOT_ALLOWED',
      message: 'The requested media asset is not licensed for this title.',
    });
  }

  if (input.operation === 'stream' && !right.streamAllowed) {
    denials.push({ code: 'STREAM_NOT_ALLOWED', message: 'Streaming is not permitted.' });
  }

  if (input.operation === 'download' && !right.offlineDownloadAllowed) {
    denials.push({
      code: 'DOWNLOAD_NOT_ALLOWED',
      message: 'Offline download is not permitted for this title.',
    });
  }

  return {
    allowed: denials.length === 0,
    denials,
    matchedRight: right,
  };
}

export function assertRightsAllowed(decision: PolicyDecision): asserts decision is PolicyDecision & {
  matchedRight: ContentRight;
} {
  if (!decision.allowed || !decision.matchedRight) {
    throw new Error(decision.denials.map((denial) => denial.code).join(',') || 'RIGHTS_DENIED');
  }
}
