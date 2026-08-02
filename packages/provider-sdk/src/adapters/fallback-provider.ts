import type { HomeResponse, SearchResponse, TitleDetail } from '@cinenova/contracts';
import type {
  MediaManifest,
  MediaManifestRequest,
  ProviderHealthResult,
  StreamingCatalogProvider,
} from '../ports';

/**
 * FallbackCatalogueProvider composes a primary provider (e.g. GZMovie/ZST LABS)
 * with a fallback provider (e.g. MockLicensedProvider). If the primary throws
 * or returns an empty catalogue, the fallback is used so the UI stays fully
 * operational and never shows a blank/warming-up state.
 *
 * This is the core "never let one provider failure break the app" guarantee:
 * safe retries are delegated, stale/fallback catalogue is served automatically,
 * and provider health reflects the effective provider.
 */

export interface FallbackProviderConfig {
  primary: StreamingCatalogProvider;
  fallback: StreamingCatalogProvider;
}

export class FallbackCatalogueProvider implements StreamingCatalogProvider {
  public readonly name = 'fallback';

  constructor(private readonly config: FallbackProviderConfig) {}

  async healthCheck(): Promise<ProviderHealthResult> {
    // Report the primary's health, but if it's unhealthy note that the
    // fallback keeps the app operational.
    const primary = await this.config.primary.healthCheck();
    if (primary.status === 'healthy') {
      return primary;
    }
    return {
      provider: this.name,
      status: 'degraded',
      latencyMs: primary.latencyMs,
      checkedAt: new Date(),
      message: `Primary provider (${this.config.primary.name}) degraded; serving fallback catalogue (${this.config.fallback.name}).`,
    };
  }

  async homepage(region: string): Promise<HomeResponse> {
    try {
      const home = await this.config.primary.homepage(region);
      if (home.rails.length > 0 || home.hero.id) {
        return home;
      }
    } catch {
      // primary failed — fall through to fallback
    }
    return this.config.fallback.homepage(region);
  }

  async search(
    query: string,
    region: string,
    kind?: 'movie' | 'series' | 'episode' | 'trailer',
  ): Promise<SearchResponse> {
    try {
      const result = await this.config.primary.search(query, region, kind);
      if (result.results.length > 0) {
        return result;
      }
    } catch {
      // primary failed — fall through to fallback
    }
    return this.config.fallback.search(query, region, kind);
  }

  async titleBySlug(slug: string, region: string): Promise<TitleDetail | null> {
    try {
      const title = await this.config.primary.titleBySlug(slug, region);
      if (title) {
        return title;
      }
    } catch {
      // primary failed — fall through to fallback
    }
    return this.config.fallback.titleBySlug(slug, region);
  }

  async titleById(id: string, region: string): Promise<TitleDetail | null> {
    try {
      const title = await this.config.primary.titleById(id, region);
      if (title) {
        return title;
      }
    } catch {
      // primary failed — fall through to fallback
    }
    return this.config.fallback.titleById(id, region);
  }

  async recommendations(titleId: string, region: string): Promise<TitleDetail[]> {
    try {
      const recs = await this.config.primary.recommendations(titleId, region);
      if (recs.length > 0) {
        return recs;
      }
    } catch {
      // primary failed — fall through to fallback
    }
    return this.config.fallback.recommendations(titleId, region);
  }

  async mediaManifest(request: MediaManifestRequest): Promise<MediaManifest | null> {
    try {
      const manifest = await this.config.primary.mediaManifest(request);
      if (manifest) {
        return manifest;
      }
    } catch {
      // primary failed — fall through to fallback
    }
    return this.config.fallback.mediaManifest(request);
  }
}
