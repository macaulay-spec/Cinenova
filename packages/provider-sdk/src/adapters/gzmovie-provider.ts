import { z } from 'zod';
import type { HomeResponse, SearchResponse, TitleDetail } from '@cinenova/contracts';
import type {
  MediaManifest,
  MediaManifestRequest,
  ProviderHealthResult,
  StreamingCatalogProvider,
} from '../ports';

const documentedGetRouteSchema = z.enum([
  '/api/search',
  '/api/trending',
  '/api/homepage',
  '/api/item-details',
  '/api/recommendations',
  '/api/popular-searches',
  '/api/hot-movies-series',
  '/api/football',
  '/api/media',
]);

const documentedPostRouteSchema = z.enum(['/api/stream']);

export interface GZMovieProviderConfig {
  enabled: boolean;
  baseUrl: string;
  legacyApiKey?: string;
  timeoutMs: number;
}

export class GZMovieProviderAdapter implements StreamingCatalogProvider {
  public readonly name = 'gzmovie';

  private readonly config: GZMovieProviderConfig;

  constructor(config: GZMovieProviderConfig) {
    this.config = config;
  }

  async healthCheck(): Promise<ProviderHealthResult> {
    if (!this.config.enabled) {
      return {
        provider: this.name,
        status: 'disabled',
        latencyMs: null,
        checkedAt: new Date(),
        message: 'GZMovie adapter is disabled by default. Enable only after legal/provider approval.',
      };
    }

    const started = performance.now();
    try {
      await this.get('/api/homepage', new URLSearchParams());
      return {
        provider: this.name,
        status: 'healthy',
        latencyMs: Math.round(performance.now() - started),
        checkedAt: new Date(),
        message: 'Documented homepage endpoint responded.',
      };
    } catch {
      return {
        provider: this.name,
        status: 'unhealthy',
        latencyMs: Math.round(performance.now() - started),
        checkedAt: new Date(),
        message: 'Documented provider health check failed; see server logs with redacted context.',
      };
    }
  }

  async homepage(_region: string): Promise<HomeResponse> {
    throw this.unsupportedUntilNormalizerComplete('homepage');
  }

  async search(_query: string, _region: string): Promise<SearchResponse> {
    throw this.unsupportedUntilNormalizerComplete('search');
  }

  async titleBySlug(_slug: string, _region: string): Promise<TitleDetail | null> {
    throw this.unsupportedUntilNormalizerComplete('titleBySlug');
  }

  async titleById(_id: string, _region: string): Promise<TitleDetail | null> {
    throw this.unsupportedUntilNormalizerComplete('titleById');
  }

  async recommendations(_titleId: string, _region: string): Promise<TitleDetail[]> {
    throw this.unsupportedUntilNormalizerComplete('recommendations');
  }

  async mediaManifest(_request: MediaManifestRequest): Promise<MediaManifest | null> {
    throw this.unsupportedUntilNormalizerComplete('mediaManifest');
  }

  private unsupportedUntilNormalizerComplete(operation: string): Error {
    return new Error(
      `GZMovie ${operation} is intentionally not wired into public APIs yet. The server-only adapter boundary exists, but response normalization, legal approval, and rights checks must be completed before enabling.`,
    );
  }

  private async get(route: z.infer<typeof documentedGetRouteSchema>, params: URLSearchParams): Promise<unknown> {
    documentedGetRouteSchema.parse(route);
    const url = new URL(route, this.config.baseUrl);
    params.forEach((value, key) => url.searchParams.set(key, value));
    return this.fetchJson(url, { method: 'GET' });
  }

  private async post(
    route: z.infer<typeof documentedPostRouteSchema>,
    body: Record<string, string | number | boolean | null>,
  ): Promise<unknown> {
    documentedPostRouteSchema.parse(route);
    const url = new URL(route, this.config.baseUrl);
    return this.fetchJson(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
  }

  private async fetchJson(url: URL, init: RequestInit): Promise<unknown> {
    if (!this.config.enabled) {
      throw new Error('GZMovie adapter is disabled.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          ...(init.headers ?? {}),
          ...(this.config.legacyApiKey ? { 'x-api-key': this.config.legacyApiKey } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Documented GZMovie endpoint failed with status ${response.status}.`);
      }

      return z.unknown().parse(await response.json());
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Kept private deliberately: provider proxy/download routes are not exposed as generic browser endpoints.
   */
  private async stream(body: Record<string, string | number | boolean | null>): Promise<unknown> {
    return this.post('/api/stream', body);
  }

  protected readonly _streamForTests = this.stream.bind(this);
}
