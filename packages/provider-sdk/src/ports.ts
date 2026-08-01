import type { HomeResponse, SearchResponse, TitleDetail } from '@cinenova/contracts';

export interface ProviderHealthResult {
  provider: string;
  status: 'disabled' | 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number | null;
  checkedAt: Date;
  message: string;
}

export interface MediaManifestRequest {
  titleId: string;
  assetId?: string;
  detailPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface MediaManifest {
  assetId: string;
  sourceType: 'mp4' | 'hls' | 'dash';
  sourceUrl: string;
  approvedHost: string;
  expiresAt: Date;
  drmActive: boolean;
}

export interface StreamingCatalogProvider {
  readonly name: string;
  healthCheck(): Promise<ProviderHealthResult>;
  homepage(region: string): Promise<HomeResponse>;
  search(query: string, region: string): Promise<SearchResponse>;
  titleBySlug(slug: string, region: string): Promise<TitleDetail | null>;
  titleById(id: string, region: string): Promise<TitleDetail | null>;
  recommendations(titleId: string, region: string): Promise<TitleDetail[]>;
  mediaManifest(request: MediaManifestRequest): Promise<MediaManifest | null>;
}
