import { randomUUID } from 'node:crypto';
import type { HomeResponse, SearchResponse, TitleDetail, TitleSummary } from '@cinenova/contracts';

/**
 * GZMovie response normalizer.
 *
 * GZMovie is an open, documented provider API used as CineNova's catalogue
 * backbone. Its raw response shapes can vary, so this module tolerantly picks
 * items/details out of common wrappers and maps field aliases onto CineNova's
 * typed contracts. Every final contract is validated by Zod upstream.
 *
 * Security: only field mapping happens here. Media URLs returned by GZMovie are
 * not trusted until they pass the provider's host/protocol validation, and the
 * provider API key is never included in normalized output.
 */

export interface GzItem {
  id?: unknown;
  subjectId?: unknown;
  subject_id?: unknown;
  title?: unknown;
  name?: unknown;
  original_title?: unknown;
  synopsis?: unknown;
  overview?: unknown;
  description?: unknown;
  plot?: unknown;
  year?: unknown;
  release_year?: unknown;
  releaseDate?: unknown;
  release_date?: unknown;
  rating?: unknown;
  maturityRating?: unknown;
  genre?: unknown;
  genres?: unknown;
  genreList?: unknown;
  category?: unknown;
  country?: unknown;
  countries?: unknown;
  countryList?: unknown;
  kind?: unknown;
  subjectType?: unknown;
  type?: unknown;
  poster?: unknown;
  image?: unknown;
  poster_path?: unknown;
  image_url?: unknown;
  backdrop?: unknown;
  backdrop_path?: unknown;
  cast?: unknown;
  director?: unknown;
  directors?: unknown;
  duration?: unknown;
  runtime?: unknown;
  runtime_seconds?: unknown;
  available?: unknown;
  stream_url?: unknown;
  streamUrl?: unknown;
  download_url?: unknown;
  video_url?: unknown;
  source?: unknown;
  detailPath?: unknown;
  detail_path?: unknown;
  season?: unknown;
  episode?: unknown;
  seasons?: unknown;
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

function firstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return asString(value[0]);
  }
  return asString(value);
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }
      if (entry && typeof entry === 'object') {
        return firstString((entry as Record<string, unknown>).name) ?? '';
      }
      return '';
    }).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((part) => part.trim()).filter(Boolean);
  }
  return [];
}

/** Pull the interesting payload out of common response wrappers. */
export function unwrapPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }
  const candidate = raw as Record<string, unknown>;

  // Wrapper keys commonly returned by provider APIs.
  for (const key of ['data', 'result', 'results', 'payload', 'response', 'items', 'list']) {
    const inner = candidate[key];
    if (Array.isArray(inner) && inner.length > 0 && typeof inner[0] === 'object') {
      return inner;
    }
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      // Recurse a single level to unwrap { data: { data: [...] } }.
      const nested = unwrapPayload(inner);
      if (Array.isArray(nested)) {
        return nested;
      }
      return inner;
    }
  }
  return raw;
}

/** Return an array of candidate items from a raw response (search/list/home). */
export function extractItems(raw: unknown): GzItem[] {
  const unwrapped = unwrapPayload(raw);
  if (Array.isArray(unwrapped)) {
    return unwrapped as GzItem[];
  }
  if (unwrapped && typeof unwrapped === 'object') {
    const candidate = unwrapped as Record<string, unknown>;
    for (const key of ['items', 'results', 'list', 'movies', 'series', 'trending', 'featured', 'data']) {
      const inner = candidate[key];
      if (Array.isArray(inner)) {
        return inner as GzItem[];
      }
    }
  }
  return [];
}

/** Extract a single item from a raw detail response. */
export function extractDetail(raw: unknown): GzItem | null {
  const unwrapped = unwrapPayload(raw);
  if (!unwrapped || typeof unwrapped !== 'object') {
    return null;
  }
  if (Array.isArray(unwrapped)) {
    return (unwrapped[0] as GzItem) ?? null;
  }
  const candidate = unwrapped as Record<string, unknown>;
  for (const key of ['item', 'movie', 'series', 'title', 'data']) {
    const inner = candidate[key];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      return inner as GzItem;
    }
  }
  return candidate as GzItem;
}

export function gzId(item: GzItem): string {
  return asString(item.subjectId) ?? asString(item.subject_id) ?? asString(item.id) ?? randomUUID();
}

export function gzTitle(item: GzItem): string {
  return (
    asString(item.title) ??
    asString(item.name) ??
    asString(item.original_title) ??
    'Untitled'
  );
}

function gzSlug(title: string, id: string): string {
  const slugged = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return slugged || id;
}

function gzKind(item: GzItem): TitleDetail['kind'] {
  const raw = asString(item.subjectType) ?? asString(item.kind) ?? asString(item.type) ?? '';
  const normalized = raw.toLowerCase();
  if (normalized.includes('serie') || normalized.includes('tv')) {
    return 'series';
  }
  if (normalized.includes('episode')) {
    return 'episode';
  }
  if (normalized.includes('trailer')) {
    return 'trailer';
  }
  return 'movie';
}

function gzMaturity(item: GzItem): TitleDetail['maturityRating'] {
  const raw = asString(item.maturityRating) ?? asString(item.rating);
  const normalized = (raw ?? '').toUpperCase();
  if (normalized.includes('NC')) {
    return 'NC_17';
  }
  if (normalized.includes('R')) {
    return 'R';
  }
  if (normalized.includes('13') || normalized.includes('PG13')) {
    return 'PG_13';
  }
  if (normalized.includes('PG')) {
    return 'PG';
  }
  return 'G';
}

function gzYear(item: GzItem): number {
  return (
    asNumber(item.year) ??
    asNumber(item.release_year) ??
    (typeof item.releaseDate === 'string' ? new Date(item.releaseDate).getFullYear() : undefined) ??
    new Date().getFullYear()
  );
}

function gzRuntime(item: GzItem): number | null {
  const seconds =
    asNumber(item.runtime_seconds) ??
    asNumber(item.duration) ??
    asNumber(item.runtime) ??
    (typeof item.duration === 'string' && /^\d+$/.test(item.duration)
      ? Number(item.duration) * 60
      : undefined);
  if (seconds !== undefined && Number.isFinite(seconds) && seconds > 0) {
    return Math.round(seconds);
  }
  return null;
}

function gzGenres(item: GzItem): string[] {
  return stringList(item.genres).length > 0 ? stringList(item.genres) : stringList(item.genre);
}

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
  'united arab emirates': 'AE',
  egypt: 'EG',
  morocco: 'MA',
  uganda: 'UG',
  tanzania: 'TZ',
  rwanda: 'RW',
  ethiopia: 'ET',
  zambia: 'ZM',
  zimbabwe: 'ZW',
  senegal: 'SN',
  'cote divoire': 'CI',
  "côte d'ivoire": 'CI',
};

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

function gzCountries(item: GzItem): string[] {
  const countries = stringList(item.countries).length > 0 ? stringList(item.countries) : stringList(item.country);
  if (countries.length === 0) {
    return ['NG'];
  }
  const mapped = countries.map(normalizeCountry).filter((c): c is string => Boolean(c));
  return mapped.length > 0 ? mapped : ['NG'];
}

function gzPoster(item: GzItem): string | undefined {
  return (
    asString(item.poster) ??
    asString(item.image) ??
    asString(item.poster_path) ??
    asString(item.image_url)
  );
}

function gzCast(item: GzItem): string[] {
  const cast = stringList(item.cast);
  return cast.length > 0 ? cast.slice(0, 12) : [];
}

function gzDirectors(item: GzItem): string[] {
  const directors = stringList(item.directors).length > 0 ? stringList(item.directors) : stringList(item.director);
  return directors.slice(0, 4);
}

function gzSynopsis(item: GzItem): string {
  return (
    asString(item.synopsis) ??
    asString(item.overview) ??
    asString(item.description) ??
    asString(item.plot) ??
    'No synopsis available for this title yet.'
  );
}

/** Map a GZMovie item onto CineNova's TitleDetail (with safe defaults). */
export function toTitleDetail(item: GzItem): TitleDetail {
  const id = gzId(item);
  const title = gzTitle(item);
  const kind = gzKind(item);
  const year = gzYear(item);
  const primaryAssetId = `gz-${id}`;
  const poster = gzPoster(item);

  return {
    id,
    slug: gzSlug(title, id),
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
          {
            url: poster,
            kind: 'poster',
            alt: `Poster artwork for ${title}`,
            width: 600,
            height: 900,
            dominantColor: '#e46b4a',
          },
        ]
      : [],
    availableFrom: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    availableUntil: new Date('2028-01-01T00:00:00.000Z').toISOString(),
    minimumPlan: 'standard',
    offlineDownloadAllowed: false,
    cast: gzCast(item),
    directors: gzDirectors(item),
    audioTracks: [{ language: 'en', label: 'English', kind: 'audio', accessibility: false }],
    subtitleTracks: [],
    seasons: [],
    primaryAssetId,
    rightsExplanation: `Streaming from the GZMovie provider. Rights enforcement is handled server-side by CineNova.`,
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

/** Build a home response from homepage raw data (hero + trending rails). */
export function toHomeResponse(raw: unknown): Omit<HomeResponse, 'generatedAt'> {
  const items = extractItems(raw);
  const details = items.slice(0, 30).map(toTitleDetail);
  const hero = details[0] ?? null;

  return {
    hero: hero ?? toTitleDetail({}),
    rails: [
      {
        id: 'gzmovie-trending',
        title: 'Trending Now',
        subtitle: 'Popular titles from the catalogue',
        items: details.map(toTitleSummary),
      },
      {
        id: 'gzmovie-featured',
        title: 'Featured',
        subtitle: 'Hand-picked highlights',
        items: details.slice(0, 12).map(toTitleSummary),
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
