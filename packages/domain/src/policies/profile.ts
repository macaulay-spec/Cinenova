import { MATURITY_RANK, type MaturityRating, type ProfilePolicyContext } from '../types';

export function isMaturityAllowed(
  profile: ProfilePolicyContext,
  requestedRating: MaturityRating,
): boolean {
  return MATURITY_RANK[requestedRating] <= MATURITY_RANK[profile.maturityCeiling];
}

export function maturityLabel(rating: MaturityRating): string {
  const labels: Record<MaturityRating, string> = {
    G: 'General audience',
    PG: 'Parental guidance',
    PG_13: 'Parental guidance 13+',
    R: 'Restricted adult profile',
    NC_17: 'Adults only',
  };

  return labels[rating];
}
