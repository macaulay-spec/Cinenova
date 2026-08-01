import { randomUUID } from 'node:crypto';
import {
  playbackSourceSchema,
  type CreatePlaybackSessionRequest,
  type PlaybackSource,
  type TitleDetail,
} from '@cinenova/contracts';
import { evaluateRights, rightsFromTitle, type PolicyDecision } from '@cinenova/domain';
import type { LocalPrincipal } from './local-principal';
import { getCatalogProvider } from './providers';

const APPROVED_MEDIA_HOSTS = new Set([
  'commondatastorage.googleapis.com',
  'storage.googleapis.com',
  'gzmovieboxapi.septorch.tech',
]);

export interface PlaybackSessionResult {
  source: PlaybackSource | null;
  title: TitleDetail | null;
  decision: PolicyDecision | null;
  error?: string;
}

export async function createPlaybackSession(
  request: CreatePlaybackSessionRequest,
  principal: LocalPrincipal,
): Promise<PlaybackSessionResult> {
  const provider = getCatalogProvider();
  const title = await provider.titleById(request.titleId, request.territory);

  if (!title) {
    return { source: null, title: null, decision: null, error: 'Title was not found.' };
  }

  const assetId = request.assetId ?? title.primaryAssetId;
  const decision = evaluateRights({
    title: {
      titleId: title.id,
      kind: title.kind,
      maturityRating: title.maturityRating,
      assetId,
    },
    rights: [rightsFromTitle(title)],
    entitlement: principal.entitlement,
    profile: principal.profile,
    territory: request.territory,
    at: new Date(),
    operation: 'stream',
  });

  if (!decision.allowed) {
    return {
      source: null,
      title,
      decision,
      error: decision.denials.map((denial) => denial.message).join(' '),
    };
  }

  const manifest = await provider.mediaManifest({ titleId: title.id, assetId });
  if (!manifest) {
    return {
      source: null,
      title,
      decision,
      error: 'No controlled media manifest is available for this asset.',
    };
  }

  const sourceUrl = new URL(manifest.sourceUrl);
  if (sourceUrl.protocol !== 'https:' || !APPROVED_MEDIA_HOSTS.has(sourceUrl.hostname)) {
    return {
      source: null,
      title,
      decision,
      error: 'The media source host is not approved for playback.',
    };
  }

  return {
    title,
    decision,
    source: playbackSourceSchema.parse({
      sessionId: randomUUID(),
      playbackUrl: manifest.sourceUrl,
      sourceType: manifest.sourceType,
      expiresAt: manifest.expiresAt.toISOString(),
      drmActive: manifest.drmActive,
      drmScheme: manifest.drmActive ? 'widevine' : 'none',
      captions: title.subtitleTracks,
      audio: title.audioTracks,
      heartbeatIntervalSeconds: 20,
      policy: {
        offlineDownloadAllowed: decision.matchedRight?.offlineDownloadAllowed ?? false,
        concurrentStreamLimit: principal.entitlement.concurrentStreamLimit,
        signedSourceUrlExposed: false,
      },
    }),
  };
}
