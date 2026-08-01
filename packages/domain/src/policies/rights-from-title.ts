import type { ContentRight } from '../types';

/**
 * Derive a ContentRight for a single normalized title.
 *
 * GZMovie is CineNova's catalogue backbone. Its normalized titles carry the
 * availability window, minimum plan, and country list used here to build the
 * rights record evaluated by `evaluateRights`. This keeps the same strict
 * rights engine working over real provider data without hard-coding mock ids.
 */
export interface TitleRightsSource {
  id: string;
  availableFrom: string;
  availableUntil: string;
  minimumPlan: 'guest' | 'free' | 'standard' | 'premium' | 'admin';
  countries: string[];
  offlineDownloadAllowed: boolean;
  primaryAssetId: string;
  trailerAssetId?: string | undefined;
}

export function rightsFromTitle(title: TitleRightsSource): ContentRight {
  return {
    id: `right-${title.id}`,
    titleId: title.id,
    territories: title.countries.length > 0 ? title.countries : ['NG'],
    startsAt: new Date(title.availableFrom),
    endsAt: new Date(title.availableUntil),
    minimumPlan: title.minimumPlan,
    streamAllowed: true,
    offlineDownloadAllowed: title.offlineDownloadAllowed,
    permittedAssetIds: [
      title.primaryAssetId,
      ...(title.trailerAssetId ? [title.trailerAssetId] : []),
    ],
  };
}
