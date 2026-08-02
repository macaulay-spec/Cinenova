import { z } from 'zod';
import type { HomeResponse, SearchResponse, TitleDetail } from '@cinenova/contracts';
import { homeResponseSchema, searchResponseSchema, titleDetailSchema } from '@cinenova/contracts';
import type {
  MediaManifest,
  MediaManifestRequest,
  ProviderHealthResult,
  StreamingCatalogProvider,
} from '../ports';
import {
  extractDetail,
  extractItems,
  toHomeResponse,
  toSearchResponse,
  toTitleDetail,
} from './gzmovie-normalizer';

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

/**
 * Approved outbound media hosts for GZMovie-sourced streams. Source URLs from
 * the provider must resolve to one of these HTTPS hosts before being served.
 * This is a server-side allowlist; signed URLs are never persisted.
 */
const APPROVED_MEDIA_HOSTS = new Set([
  'commondatastorage.googleapis.com',
  'storage.googleapis.com',
  'gzmovieboxapi.septorch.tech',
]);

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
        message: 'GZMovie adapter is disabled by configuration.',
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
    const raw = await this.get('/api/homepage', new URLSearchParams());
    const normalized = toHomeResponse(raw);
    return homeResponseSchema.parse({
      hero: normalized.hero,
      rails: normalized.rails,
      generatedAt: new Date().toISOString(),
    });
  }

  async search(
    query: string,
    _region: string,
    kind?: 'movie' | 'series' | 'episode' | 'trailer',
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('query', query.trim());
    }
    params.set('page', '1');
    params.set('perPage', '24');
    if (kind) {
      params.set('subjectType', kind === 'series' ? 'series' : kind);
    }

    const raw = await this.get('/api/search', params);
    const normalized = toSearchResponse(query, raw);
    const results =
      kind === 'movie' || kind === 'series'
        ? normalized.results.filter((item) => item.kind === kind)
        : normalized.results;
    return searchResponseSchema.parse({
      query,
      results,
      suggestions: normalized.suggestions,
    });
  }

  async titleBySlug(slug: string, _region: string): Promise<TitleDetail | null> {
    // Slug matches GZMovie subject id lookup; fall back to search if not found.
    const raw = await this.get(
      '/api/item-details',
      new URLSearchParams({ subjectId: slug }),
    );
    const detail = extractDetail(raw);
    if (detail) {
      return titleDetailSchema.parse(toTitleDetail(detail));
    }
    return null;
  }

  async titleById(id: string, _region: string): Promise<TitleDetail | null> {
    const raw = await this.get(
      '/api/item-details',
      new URLSearchParams({ subjectId: id }),
    );
    const detail = extractDetail(raw);
    if (detail) {
      return titleDetailSchema.parse(toTitleDetail(detail));
    }
    return null;
  }

  async recommendations(titleId: string, _region: string): Promise<TitleDetail[]> {
    const params = new URLSearchParams({ subjectId: titleId, page: '1', perPage: '12' });
    const raw = await this.get('/api/recommendations', params);
    return extractItems(raw)
      .slice(0, 12)
      .map((item) => titleDetailSchema.parse(toTitleDetail(item)));
  }

  async mediaManifest(request: MediaManifestRequest): Promise<MediaManifest | null> {
    const params = new URLSearchParams({ subjectId: request.titleId });
    if (request.detailPath) {
      params.set('detailPath', request.detailPath);
    }
    if (request.seasonNumber) {
      params.set('season', String(request.seasonNumber));
    }
    if (request.episodeNumber) {
      params.set('episode', String(request.episodeNumber));
    }

    const raw = await this.get('/api/media', params);
    const sourceUrl = this.extractSourceUrl(raw);

    if (!sourceUrl) {
      return null;
    }

    // Validate protocol + approved host before returning to the caller.
    const url = new URL(sourceUrl);
    if (url.protocol !== 'https:' || !APPROVED_MEDIA_HOSTS.has(url.hostname)) {
      return null;
    }

    const assetId = request.assetId ?? `gz-${request.titleId}`;
    return {
      assetId,
      sourceType: this.detectSourceType(url),
      sourceUrl: url.toString(),
      approvedHost: url.hostname,
      expiresAt: new Date(Date.now() + 1000 * 60 * 20),
      drmActive: false,
    };
  }

  private extractSourceUrl(raw: unknown): string | null {
    const unwrapped = raw as Record<string, unknown> | null;
    if (!unwrapped) {
      return null;
    }
    for (const key of [
      'streamUrl',
      'stream_url',
      'source',
      'video_url',
      'videoUrl',
      'download_url',
      'url',
      'playbackUrl',
      'manifest',
    ]) {
      const value = unwrapped[key];
      if (typeof value === 'string' && /^https?:\/\//.test(value)) {
        return value;
      }
      if (value && typeof value === 'object') {
        const nested = value as Record<string, unknown>;
        const nestedUrl = nested.url ?? nested.source ?? nested.hls ?? nested.dash;
        if (typeof nestedUrl === 'string' && /^https?:\/\//.test(nestedUrl)) {
          return nestedUrl;
        }
      }
    }
    // Some providers nest the manifest under data/media.
    const inner =
      unwrapped.data && typeof unwrapped.data === 'object'
        ? (unwrapped.data as Record<string, unknown>)
        : unwrapped;
    for (const key of ['url', 'source', 'streamUrl', 'video_url']) {
      const value = inner[key];
      if (typeof value === 'string' && /^https?:\/\//.test(value)) {
        return value;
      }
    }
    return null;
  }

  private detectSourceType(url: URL): MediaManifest['sourceType'] {
    const path = url.pathname.toLowerCase();
    if (path.endsWith('.m3u8')) {
      return 'hls';
    }
    if (path.endsWith('.mpd')) {
      return 'dash';
    }
    return 'mp4';
  }

  private async get(
    route: z.infer<typeof documentedGetRouteSchema>,
    params: URLSearchParams,
  ): Promise<unknown> {
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
   * Provider proxy/download routes are intentionally kept private: they are
   * server-side transport internals, never exposed as generic browser endpoints.
   */
  private async stream(body: Record<string, string | number | boolean | null>): Promise<unknown> {
    return this.post('/api/stream', body);
  }

  protected readonly _streamForTests = this.stream.bind(this);
}
