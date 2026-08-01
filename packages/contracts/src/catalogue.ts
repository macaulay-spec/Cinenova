import { z } from 'zod';
import { isoDateSchema, maturityRatingSchema, planCodeSchema, titleKindSchema, uuidSchema } from './common';

export const artworkSchema = z.object({
  url: z.string().url().or(z.string().startsWith('/')),
  kind: z.enum(['poster', 'landscape', 'hero', 'logo']),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  dominantColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const trackSchema = z.object({
  language: z.string().min(2),
  label: z.string().min(1),
  kind: z.enum(['subtitles', 'captions', 'audio']),
  accessibility: z.boolean().default(false),
});

export const titleSummarySchema = z.object({
  id: uuidSchema,
  slug: z.string().min(1),
  kind: titleKindSchema,
  title: z.string().min(1),
  synopsis: z.string().min(1),
  releaseYear: z.number().int().min(1888).max(3000),
  runtimeSeconds: z.number().int().positive().nullable(),
  maturityRating: maturityRatingSchema,
  genres: z.array(z.string().min(1)),
  countries: z.array(z.string().length(2)),
  artwork: z.array(artworkSchema),
  availableFrom: isoDateSchema,
  availableUntil: isoDateSchema,
  minimumPlan: planCodeSchema,
  offlineDownloadAllowed: z.boolean(),
  reasonLabel: z.string().optional(),
});

export const episodeSchema = z.object({
  id: uuidSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  synopsis: z.string().min(1),
  seasonNumber: z.number().int().positive(),
  episodeNumber: z.number().int().positive(),
  runtimeSeconds: z.number().int().positive(),
  assetId: uuidSchema,
});

export const seasonSchema = z.object({
  id: uuidSchema,
  seasonNumber: z.number().int().positive(),
  title: z.string().min(1),
  episodes: z.array(episodeSchema),
});

export const titleDetailSchema = titleSummarySchema.extend({
  cast: z.array(z.string()),
  directors: z.array(z.string()),
  audioTracks: z.array(trackSchema),
  subtitleTracks: z.array(trackSchema),
  seasons: z.array(seasonSchema),
  trailerAssetId: uuidSchema.optional(),
  primaryAssetId: uuidSchema,
  rightsExplanation: z.string(),
});

export const catalogueRailSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  items: z.array(titleSummarySchema),
});

export const homeResponseSchema = z.object({
  hero: titleDetailSchema,
  rails: z.array(catalogueRailSchema),
  generatedAt: isoDateSchema,
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(0).max(120).default(''),
  kind: titleKindSchema.optional(),
  genre: z.string().optional(),
  region: z.string().length(2).default('NG'),
});

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.array(titleSummarySchema),
  suggestions: z.array(z.string()),
});

export type Artwork = z.infer<typeof artworkSchema>;
export type TitleSummary = z.infer<typeof titleSummarySchema>;
export type TitleDetail = z.infer<typeof titleDetailSchema>;
export type CatalogueRail = z.infer<typeof catalogueRailSchema>;
export type HomeResponse = z.infer<typeof homeResponseSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
