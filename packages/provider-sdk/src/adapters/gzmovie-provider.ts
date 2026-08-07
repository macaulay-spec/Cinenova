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
  enrichTitleDetail,
  extractBanners,
  extractItems,
  extractStars,
  extractSubject,
  toHomeResponse,
  toSearchResponse,
  toTitleDetail,
} from './gzmovie-normalizer';

const documentedGetRouteSchema = z.enum([
  '/api/homepage',
  '/api/search',
  '/api/item-details',
  '/api/recommendations',
  '/api/trending',
  '/api/new-releases',
  '/api/hot-movies-series',
  '/api/popular-searches',
  '/api/media',
]);

const documentedPostRouteSchema = z.enum(['/api/stream']);

export interface GZMovieProviderConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
}

/**
 * Approved outbound media hosts for ZST LABS streams. Source URLs must resolve
 * to one of these HTTPS hosts before being served. This is a server-side
 * allowlist; signed URLs are never persisted.
 */
const APPROVED_MEDIA_HOSTS = new Set([
  'bcdnxw.hakunaymatata.com',
  'commondatastorage.googleapis.com',
  'storage.googleapis.com',
]);

export class GZMovieProviderAdapter implements StreamingCatalogProvider {
  public readonly name = 'gzmovie';

  private readonly config: GZMovieProviderConfig;

  /** detailPath -> subjectId map, populated from search/homepage results. */
  private readonly slugToSubjectId = new Map<string, string>();

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
        message: 'ZST LABS adapter is disabled by configuration.',
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
    // The real homepage nests content in operatingList[].banner.items[] (not a
    // top-level items array). Supplement the rails with trending + hot content
    // so the home shows real discovery data, not an empty page.
    const banners = extractBanners(raw);

    // Enrich the home rails with trending + hot movies/series (best-effort).
    const trending = await this.trendingItems();
    const hot = await this.hotItems();

    const extra = [...trending, ...hot];
    let fallbackItems = [] as Record<string, unknown>[];
    if (banners.length === 0 && extra.length === 0) {
      try {
        const searchRaw = await this.get(
          '/api/search',
          new URLSearchParams({ query: 'a', perPage: '40', page: '1' }),
        );
        fallbackItems = extractItems(searchRaw);
      } catch {
        fallbackItems = [];
      }
    }

    const bannerItems = banners.map((b) => b);
    this.indexItems(bannerItems as Record<string, unknown>[]);
    this.indexItems([...extra, ...fallbackItems]);
    const normalized = toHomeResponse(raw, [...extra, ...fallbackItems]);
    return homeResponseSchema.parse({
      hero: normalized.hero,
      rails: normalized.rails,
      generatedAt: new Date().toISOString(),
    });
  }

  /** Fetch `/api/trending` and normalize its `subjectList` into items. */
  private async trendingItems(): Promise<Record<string, unknown>[]> {
    try {
      const raw = await this.get('/api/trending', new URLSearchParams({ page: '1', perPage: '18' }));
      const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).data : undefined;
      const list =
        data && typeof data === 'object'
          ? (data as Record<string, unknown>).subjectList
          : undefined;
      return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
    } catch {
      return [];
    }
  }

  /** Fetch `/api/hot-movies-series` and merge movie + tv arrays. */
  private async hotItems(): Promise<Record<string, unknown>[]> {
    try {
      const raw = await this.get('/api/hot-movies-series', new URLSearchParams());
      const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).data : undefined;
      const movie = data && typeof data === 'object' ? (data as Record<string, unknown>).movie : undefined;
      const tv = data && typeof data === 'object' ? (data as Record<string, unknown>).tv : undefined;
      return [
        ...(Array.isArray(movie) ? (movie as Record<string, unknown>[]) : []),
        ...(Array.isArray(tv) ? (tv as Record<string, unknown>[]) : []),
      ];
    } catch {
      return [];
    }
  }

  async search(
    query: string,
    _region: string,
    kind?: 'movie' | 'series' | 'episode' | 'trailer',
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();
    // The ZST LABS search API rejects an empty query with 400. For an empty
    // search, fall back to a broad default term so the endpoint never fails.
    const effectiveQuery = query.trim() || 'movie';
    params.set('query', effectiveQuery);
    params.set('page', '1');
    params.set('perPage', '24');
    params.set('subjectType', kind === 'series' ? '2' : kind === 'movie' ? '1' : 'ALL');

    const raw = await this.get('/api/search', params);
    const items = extractItems(raw);
    this.indexItems(items);
    const normalized = toSearchResponse(query, raw);
    return searchResponseSchema.parse({
      query,
      results: normalized.results,
      suggestions: normalized.suggestions,
    });
  }

  async titleBySlug(slug: string, _region: string): Promise<TitleDetail | null> {
    const subjectId = this.slugToSubjectId.get(slug);
    if (subjectId) {
      return this.titleById(subjectId, _region);
    }

    // Fallback: derive a search term from the slug's readable part.
    const searchTerm = slug.split('-').slice(0, 4).join(' ').replace(/-/g, ' ');
    try {
      const searchRaw = await this.get(
        '/api/search',
        new URLSearchParams({ query: searchTerm, perPage: '12', page: '1' }),
      );
      const match = extractItems(searchRaw).find((item) => this.slugOf(item) === slug);
      if (match) {
        const id = String(match.subjectId);
        this.slugToSubjectId.set(slug, id);
        return this.titleById(id, _region);
      }
    } catch {
      // fall through
    }
    return null;
  }

  async titleById(id: string, _region: string): Promise<TitleDetail | null> {
    const raw = await this.get('/api/item-details', new URLSearchParams({ subjectId: id }));
    const subject = extractSubject(raw);
    if (!subject) {
      return null;
    }
    const base = toTitleDetail(subject);
    const stars = extractStars(raw);
    const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).data : undefined;
    const seasons = data && typeof data === 'object' ? (data as Record<string, unknown>).seasons ?? [] : [];
    if (subject.detailPath) {
      this.slugToSubjectId.set(String(subject.detailPath), id);
    }
    return titleDetailSchema.parse(enrichTitleDetail(base, stars, seasons as unknown[]));
  }

  async recommendations(titleId: string, _region: string): Promise<TitleDetail[]> {
    const params = new URLSearchParams({ subjectId: titleId, page: '1', perPage: '12' });
    const raw = await this.get('/api/recommendations', params);
    const items = extractItems(raw);
    this.indexItems(items);
    return items.slice(0, 12).map((item) => titleDetailSchema.parse(toTitleDetail(item)));
  }

  async mediaManifest(request: MediaManifestRequest): Promise<MediaManifest | null> {
    const params = new URLSearchParams({ subjectId: request.titleId });
    if (request.detailPath) {
      params.set('detailPath', request.detailPath);
    }
    const { season, episode } = this.parseAssetId(request.assetId);
    if (season) {
      params.set('season', String(season));
    }
    if (episode) {
      params.set('episode', String(episode));
    }

    const raw = await this.get('/api/media', params);
    const sourceUrl = this.extractMediaUrl(raw);

    if (!sourceUrl) {
      return null;
    }

    const url = new URL(sourceUrl);
    if (url.protocol !== 'https:' || !APPROVED_MEDIA_HOSTS.has(url.hostname)) {
      return null;
    }

    return {
      assetId: request.assetId ?? `gz-${request.titleId}`,
      sourceType: 'mp4',
      sourceUrl: url.toString(),
      approvedHost: url.hostname,
      expiresAt: new Date(Date.now() + 1000 * 60 * 20),
      drmActive: false,
    };
  }

  /** Parse an asset id encoded as `<subjectId>:<season>:<episode>`. */
  private parseAssetId(assetId?: string): { season?: number; episode?: number } {
    if (!assetId) {
      return {};
    }
    const parts = assetId.split(':');
    if (parts.length === 3) {
      const season = Number(parts[1]);
      const episode = Number(parts[2]);
      return {
        ...(Number.isFinite(season) && season > 0 ? { season } : {}),
        ...(Number.isFinite(episode) && episode > 0 ? { episode } : {}),
      };
    }
    return {};
  }

  /** Extract the highest-resolution playable mp4 URL from /api/media data. */
  private extractMediaUrl(raw: unknown): string | null {
    const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).data : undefined;
    const downloads =
      data && typeof data === 'object'
        ? (data as Record<string, unknown>).downloads
        : undefined;
    const innerData =
      downloads && typeof downloads === 'object'
        ? (downloads as Record<string, unknown>).data
        : undefined;
    const list =
      innerData && typeof innerData === 'object'
        ? (innerData as Record<string, unknown>).downloads
        : undefined;

    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }

    const sorted = [...(list as Record<string, unknown>[])].sort(
      (a, b) => (Number(b.resolution) || 0) - (Number(a.resolution) || 0),
    );
    const best = sorted[0];
    const url = best?.url;
    return typeof url === 'string' && /^https?:\/\//.test(url) ? url : null;
  }

  private slugOf(item: Record<string, unknown>): string {
    return typeof item.detailPath === 'string' ? item.detailPath : '';
  }

  private indexItems(items: Record<string, unknown>[]): void {
    for (const item of items) {
      const detailPath = this.slugOf(item);
      const subjectId = item.subjectId;
      if (detailPath && subjectId !== undefined) {
        this.slugToSubjectId.set(detailPath, String(subjectId));
      }
    }
  }

  private async get(
    route: z.infer<typeof documentedGetRouteSchema>,
    params: URLSearchParams,
  ): Promise<unknown> {
    documentedGetRouteSchema.parse(route);
    const url = new URL(route, this.config.baseUrl);
    params.forEach((value, key) => url.searchParams.set(key, value));
    this.setAuthQuery(url);
    return this.fetchJson(url, { method: 'GET' });
  }

  /** Append the API key as a query param when present (proven auth method). */
  private setAuthQuery(url: URL): void {
    if (this.config.apiKey && !url.searchParams.has('apikey')) {
      url.searchParams.set('apikey', this.config.apiKey);
    }
  }

  private async post(
    route: z.infer<typeof documentedPostRouteSchema>,
    body: Record<string, string | number | boolean | null>,
  ): Promise<unknown> {
    documentedPostRouteSchema.parse(route);
    const url = new URL(route, this.config.baseUrl);
    this.setAuthQuery(url);
    return this.fetchJson(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
  }

  private async fetchJson(url: URL, init: RequestInit): Promise<unknown> {
    if (!this.config.enabled) {
      throw new Error('ZST LABS adapter is disabled.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          ...(init.headers ?? {}),
          ...(this.config.apiKey ? { 'x-api-key': this.config.apiKey } : {}),
        },
      });

      if (!response.ok) {
        // Log the failure server-side with a redacted reason. Never log the key
        // or the full signed URL.
        console.error(
          JSON.stringify({
            level: 'error',
            message: 'ZST LABS provider request failed',
            path: url.pathname,
            status: response.status,
            provider: this.name,
            time: new Date().toISOString(),
          }),
        );
        throw new Error(`Documented ZST LABS endpoint failed with status ${response.status}.`);
      }

      return z.unknown().parse(await response.json());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      console.error(
        JSON.stringify({
          level: 'error',
          message: 'ZST LABS provider request error',
          path: url.pathname,
          reason: message,
          provider: this.name,
          time: new Date().toISOString(),
        }),
      );
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async stream(body: Record<string, string | number | boolean | null>): Promise<unknown> {
    return this.post('/api/stream', body);
  }

  protected readonly _streamForTests = this.stream.bind(this);
}
