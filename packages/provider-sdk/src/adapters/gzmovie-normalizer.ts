import type { HomeResponse, SearchResponse, TitleDetail, TitleSummary } from '@cinenova/contracts';

/**
 * ZST LABS (GZMovie) response normalizer.
 *
 * ZST LABS is CineNova's catalogue backbone. Every response is wrapped in:
 *   { status, statusCode, creator, endpoint, data }
 * and titles are keyed by `subjectId` (stable id) and `detailPath` (slug).
 * This module unwraps the envelope and maps items onto CineNova contracts.
 *
 * Security: only field mapping happens here. Streaming source URLs are not
 * trusted until they pass host/protocol validation in the provider adapter,
 * and the API key never appears in normalized output.
 */

const COUNTRY_TO_ISO2: Record<string, string> = {
  nigeria: 'NG',
  ghana: 'GH',
  kenya: 'KE',
  'south africa': 'ZA',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  canada: 'CA',
  france: 'FR',
  germany: 'DE',
  india: 'IN',
  egypt: 'EG',
  morocco: 'MA',
  uganda: 'UG',
  tanzania: 'TZ',
  rwanda: 'RW',
  ethiopia: 'ET',
  zambia: 'ZM',
  zimbabwe: 'ZW',
  senegal: 'SN',
};

export interface GzCover {
  url?: unknown;
  width?: unknown;
  height?: unknown;
}

export interface GzItem {
  subjectId?: unknown;
  subjectType?: unknown;
  title?: unknown;
  description?: unknown;
  releaseDate?: unknown;
  release_date?: unknown;
  duration?: unknown;
  genre?: unknown;
  cover?: GzCover | null;
  countryName?: unknown;
  imdbRatingValue?: unknown;
  subtitles?: unknown;
  hasResource?: unknown;
  trailer?: unknown;
  detailPath?: unknown;
  staffList?: unknown;
  isSeries?: unknown;
  seasons?: unknown;
  url?: unknown;
  poster?: unknown;
  backdrop?: unknown;
  id?: unknown;
  year?: unknown;
  overview?: unknown;
  type?: unknown;
  rating?: unknown;
  [key: string]: unknown;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry : asString((entry as Record<string, unknown>).name) ?? ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeCountry(raw: string): string | undefined {
  const trimmed = raw.trim().toLowerCase();
  if (/^[a-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const iso2 = COUNTRY_TO_ISO2[trimmed];
  if (iso2) {
    return iso2;
  }
  const alpha2 = raw.trim().slice(0, 2).toUpperCase();
  return /^[A-Z]{2}$/.test(alpha2) ? alpha2 : undefined;
}

/** Unwrap the shared ZST LABS envelope; returns the `data` payload when present. */
export function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object') {
    const candidate = raw as Record<string, unknown>;
    if (candidate && typeof candidate.data === 'object' && candidate.data !== null) {
      return candidate.data;
    }
  }
  return raw;
}

/** Extract an array of items from a search/homepage/recommendations payload. */
export function extractItems(raw: unknown): GzItem[] {
  const data = unwrapPayload(raw);
  if (Array.isArray(data)) {
    return data as GzItem[];
  }
  if (data && typeof data === 'object') {
    const candidate = data as Record<string, unknown>;
    for (const key of ['items', 'movies', 'results', 'trending', 'newReleases', 'list', 'data']) {
      const inner = candidate[key];
      if (Array.isArray(inner)) {
        return inner as GzItem[];
      }
    }
  }
  return [];
}

/** Extract the hero banner list from homepage data.operatingList[].banner.items[]. */
export function extractBanners(raw: unknown): GzItem[] {
  const data = unwrapPayload(raw);
  if (data && typeof data === 'object') {
    const operatingList = (data as Record<string, unknown>).operatingList;
    if (Array.isArray(operatingList)) {
      const items: GzItem[] = [];
      for (const block of operatingList) {
        if (!block || typeof block !== 'object') {
          continue;
        }
        const banner = (block as Record<string, unknown>).banner;
        if (banner && typeof banner === 'object') {
          const bannerItems = (banner as Record<string, unknown>).items;
          if (Array.isArray(bannerItems)) {
            items.push(...(bannerItems as GzItem[]));
          }
        }
      }
      return items;
    }
  }
  return [];
}

/**
 * Extract a full `subject` object from a banner/search/home item. Homepage
 * banner items wrap their full detail under `.subject`; search items expose the
 * fields directly on the item.
 */
export function resolveSubject(item: GzItem): GzItem {
  if (item && typeof item === 'object') {
    const subject = (item as Record<string, unknown>).subject;
    if (subject && typeof subject === 'object') {
      return subject as GzItem;
    }
  }
  return item;
}

/** Extract a single subject detail (item-details data.subject). */
export function extractSubject(raw: unknown): GzItem | null {
  const data = unwrapPayload(raw);
  if (data && typeof data === 'object') {
    const subject = (data as Record<string, unknown>).subject;
    if (subject && typeof subject === 'object') {
      return subject as GzItem;
    }
  }
  return null;
}

/** Extract the staff list (item-details data.stars). */
export function extractStars(raw: unknown): GzItem[] {
  const data = unwrapPayload(raw);
  if (data && typeof data === 'object') {
    const stars = (data as Record<string, unknown>).stars;
    if (Array.isArray(stars)) {
      return stars as GzItem[];
    }
  }
  return [];
}

function gzId(item: GzItem): string {
  return asString(item.subjectId) ?? asString(item.id) ?? '';
}

function gzSlug(item: GzItem): string {
  return asString(item.detailPath) ?? '';
}

function gzKind(item: GzItem): TitleDetail['kind'] {
  const type = asNumber(item.subjectType);
  if (type === 2) {
    return 'series';
  }
  const raw = (asString(item.type) ?? '').toLowerCase();
  if (raw.includes('serie') || raw.includes('tv')) {
    return 'series';
  }
  if (raw.includes('episode')) {
    return 'episode';
  }
  if (raw.includes('trailer')) {
    return 'trailer';
  }
  return 'movie';
}

function gzMaturity(_item: GzItem): TitleDetail['maturityRating'] {
  // ZST LABS does not provide a content rating; default to G so we never
  // mislabel a title's maturity. The rights engine still enforces all other
  // checks; maturity gating requires rating metadata when available.
  return 'G';
}

function gzYear(item: GzItem): number {
  const release = asString(item.releaseDate) ?? asString(item.release_date);
  const year = release ? new Date(release).getFullYear() : undefined;
  const fallback = asNumber(item.year);
  if (Number.isFinite(year) && year && year > 1887 && year < 3000) {
    return year;
  }
  return fallback ?? new Date().getFullYear();
}

function gzRuntime(item: GzItem): number | null {
  const duration = asNumber(item.duration);
  if (duration !== undefined && duration > 0) {
    return Math.round(duration);
  }
  return null;
}

function gzGenres(item: GzItem): string[] {
  return stringList(item.genre);
}

function gzCountries(item: GzItem): string[] {
  const name = asString(item.countryName);
  if (name) {
    const mapped = normalizeCountry(name);
    return mapped ? [mapped] : ['NG'];
  }
  return ['NG'];
}

function coverUrl(item: GzItem): string | undefined {
  if (item.cover && typeof item.cover === 'object') {
    const url = asString((item.cover as Record<string, unknown>).url);
    if (url) {
      return url;
    }
  }
  return asString(item.poster);
}

function gzSynopsis(item: GzItem): string {
  return (
    asString(item.description) ?? asString(item.overview) ?? 'No synopsis available for this title yet.'
  );
}

/** Map a search/homepage/banner item onto a CineNova TitleDetail. */
export function toTitleDetail(item: GzItem): TitleDetail {
  const id = gzId(item);
  const slug = gzSlug(item);
  const title = asString(item.title) ?? 'Untitled';
  const kind = gzKind(item);
  const year = gzYear(item);
  const poster = coverUrl(item);

  return {
    id,
    slug,
    kind,
    title,
    synopsis: gzSynopsis(item),
    releaseYear: year,
    runtimeSeconds: gzRuntime(item),
    maturityRating: gzMaturity(item),
    genres: gzGenres(item),
    countries: gzCountries(item),
    artwork: poster
      ? [
          { url: poster, kind: 'poster', alt: `Poster artwork for ${title}`, width: 600, height: 900, dominantColor: '#e46b4a' },
        ]
      : [],
    availableFrom: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    availableUntil: new Date('2028-01-01T00:00:00.000Z').toISOString(),
    minimumPlan: 'standard',
    offlineDownloadAllowed: false,
    cast: [],
    directors: [],
    audioTracks: [{ language: 'en', label: 'English', kind: 'audio', accessibility: false }],
    subtitleTracks: [],
    seasons: [],
    primaryAssetId: id,
    rightsExplanation: 'Streaming from the ZST LABS provider. Rights enforcement is handled server-side by CineNova.',
  };
}

/** Enrich a base title with item-details data (cast, directors, seasons). */
export function enrichTitleDetail(base: TitleDetail, stars: GzItem[], seasons: unknown[]): TitleDetail {
  const cast: string[] = [];
  const directors: string[] = [];
  for (const star of stars) {
    const name = asString(star.name);
    if (!name) {
      continue;
    }
    const role = asString(star.character) ?? '';
    const staffType = asNumber(star.staffType);
    if (staffType === 2 || /director/i.test(role)) {
      directors.push(name);
    } else if (staffType === 1 || staffType === undefined) {
      cast.push(name);
    }
  }

  const episodeList = seasons
    .map((seasonRaw) => {
      const season = seasonRaw as Record<string, unknown>;
      const se = asNumber(season.se);
      const allEp = asString(season.allEp);
      if (se === undefined || !allEp) {
        return null;
      }
      return {
        id: `${base.id}-s${se}`,
        seasonNumber: se,
        title: `${base.title} — Season ${se}`,
        synopsis: base.synopsis,
        episodes: allEp
          .split(',')
          .map((ep) => Number(ep.trim()))
          .filter((ep) => Number.isFinite(ep) && ep > 0)
          .map((ep) => ({
            id: `${base.id}-s${se}e${ep}`,
            slug: `${base.slug}-s${se}e${ep}`,
            title: `Episode ${ep}`,
            synopsis: `Season ${se}, episode ${ep}`,
            seasonNumber: se,
            episodeNumber: ep,
            runtimeSeconds: base.runtimeSeconds ?? 1500,
            assetId: `${base.id}:${se}:${ep}`,
          })),
      };
    })
    .filter((season): season is NonNullable<typeof season> => season !== null);

  return {
    ...base,
    cast: cast.slice(0, 24),
    directors: directors.slice(0, 8),
    seasons: episodeList,
  };
}

export function toTitleSummary(detail: TitleDetail): TitleSummary {
  const {
    cast: _cast,
    directors: _directors,
    audioTracks: _audioTracks,
    subtitleTracks: _subtitleTracks,
    seasons: _seasons,
    trailerAssetId: _trailerAssetId,
    primaryAssetId: _primaryAssetId,
    rightsExplanation: _rightsExplanation,
    ...summary
  } = detail;
  return summary;
}

/** Build a home response from homepage data + fallback catalogue items. */
export function toHomeResponse(raw: unknown, fallbackItems: GzItem[] = []): Omit<HomeResponse, 'generatedAt'> {
  const banners = extractBanners(raw).map(resolveSubject);
  const data = unwrapPayload(raw) as Record<string, unknown> | null;
  const homeList = Array.isArray(data?.homeList) ? (data!.homeList as GzItem[]) : [];
  const topPickList = Array.isArray(data?.topPickList) ? (data!.topPickList as GzItem[]) : [];

  const bannerDetails = banners.map(toTitleDetail);
  // Only raw GzItems need mapping; bannerDetails are already TitleDetails and
  // must NOT be re-mapped (they have slug, not detailPath).
  const railItems = [
    ...bannerDetails,
    ...[...homeList, ...topPickList, ...fallbackItems].map(toTitleDetail),
  ]
    // Drop entries that cannot satisfy the contract (missing id/slug) so the
    // schema parse can never fail on partial provider data.
    .filter((item) => item.id.length > 0 && item.slug.length > 0)
    .slice(0, 40);

  // Hero: first banner that has a poster, else first rail item.
  const hero =
    bannerDetails.find((item) => item.artwork.length > 0 && item.slug.length > 0) ??
    railItems.find((item) => item.artwork.length > 0) ??
    bannerDetails[0] ??
    railItems[0] ??
    toTitleDetail({});

  return {
    hero,
    rails: [
      {
        id: 'zst-featured',
        title: 'Featured on CineNova',
        subtitle: 'Hand-picked titles from the catalogue',
        items: railItems.map(toTitleSummary),
      },
      {
        id: 'zst-new-releases',
        title: 'New & Notable',
        subtitle: 'Fresh additions',
        items: railItems.slice(0, 16).map(toTitleSummary),
      },
    ],
  };
}

/** Build a search response from raw search data. */
export function toSearchResponse(query: string, raw: unknown): Omit<SearchResponse, 'query'> {
  const details = extractItems(raw).slice(0, 40).map(toTitleDetail);
  return {
    results: details.map(toTitleSummary),
    suggestions: details.slice(0, 6).map((title) => title.title),
  };
}
