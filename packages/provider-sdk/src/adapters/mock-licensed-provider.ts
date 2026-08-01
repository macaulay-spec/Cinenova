import type { HomeResponse, SearchResponse, TitleDetail } from '@cinenova/contracts';
import { homeResponseSchema, searchResponseSchema, titleDetailSchema } from '@cinenova/contracts';
import { MOCK_ASSET_URLS, MOCK_HOME, MOCK_TITLES, toTitleSummary } from '../mock-data';
import type {
  MediaManifest,
  MediaManifestRequest,
  ProviderHealthResult,
  StreamingCatalogProvider,
} from '../ports';

function includesQuery(title: TitleDetail, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [title.title, title.synopsis, ...title.genres, ...title.cast, ...title.directors]
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalized);
}

function findTitle(id: string): TitleDetail | undefined {
  return MOCK_TITLES.find((title) => title.id === id);
}

export class MockLicensedProviderAdapter implements StreamingCatalogProvider {
  public readonly name = 'mock-licensed';

  async healthCheck(): Promise<ProviderHealthResult> {
    return {
      provider: this.name,
      status: 'healthy',
      latencyMs: 1,
      checkedAt: new Date(),
      message: 'Mock licensed provider is local and available.',
    };
  }

  async homepage(_region: string): Promise<HomeResponse> {
    return homeResponseSchema.parse({ ...MOCK_HOME, generatedAt: new Date().toISOString() });
  }

  async search(query: string, region: string): Promise<SearchResponse> {
    const normalizedRegion = region.toUpperCase();
    const results = MOCK_TITLES.filter((title) =>
      title.countries.includes(normalizedRegion) || title.id === 'title-orbit-silence',
    )
      .filter((title) => includesQuery(title, query))
      .map(toTitleSummary);

    return searchResponseSchema.parse({
      query,
      results,
      suggestions: ['sci-fi', 'Lagos', 'family adventure', 'premium premieres'].filter((suggestion) =>
        suggestion.toLowerCase().includes(query.toLowerCase().slice(0, 3)),
      ),
    });
  }

  async titleBySlug(slug: string, _region: string): Promise<TitleDetail | null> {
    const title = MOCK_TITLES.find((candidate) => candidate.slug === slug);
    return title ? titleDetailSchema.parse(title) : null;
  }

  async titleById(id: string, _region: string): Promise<TitleDetail | null> {
    const title = findTitle(id);
    return title ? titleDetailSchema.parse(title) : null;
  }

  async recommendations(titleId: string, _region: string): Promise<TitleDetail[]> {
    const base = findTitle(titleId);
    if (!base) {
      return [];
    }

    const baseGenres = new Set(base.genres);
    return MOCK_TITLES.filter((title) => title.id !== titleId)
      .sort((left, right) => {
        const leftScore = left.genres.filter((genre) => baseGenres.has(genre)).length;
        const rightScore = right.genres.filter((genre) => baseGenres.has(genre)).length;
        return rightScore - leftScore;
      })
      .slice(0, 6);
  }

  async mediaManifest(request: MediaManifestRequest): Promise<MediaManifest | null> {
    const title = findTitle(request.titleId);
    if (!title) {
      return null;
    }

    const assetId = request.assetId ?? title.primaryAssetId;
    const asset = MOCK_ASSET_URLS[assetId];
    if (!asset) {
      return null;
    }

    return {
      assetId,
      sourceType: asset.type,
      sourceUrl: asset.url,
      approvedHost: asset.host,
      expiresAt: new Date(Date.now() + 1000 * 60 * 20),
      drmActive: false,
    };
  }
}
