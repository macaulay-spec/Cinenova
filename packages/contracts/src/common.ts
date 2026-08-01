import { z } from 'zod';

export const uuidSchema = z.string().min(1);
export const isoDateSchema = z.string().datetime();

export const planCodeSchema = z.enum(['guest', 'free', 'standard', 'premium', 'admin']);
export const titleKindSchema = z.enum(['movie', 'series', 'episode', 'trailer']);
export const maturityRatingSchema = z.enum(['G', 'PG', 'PG_13', 'R', 'NC_17']);

export const problemDetailsSchema = z.object({
  type: z.string().default('about:blank'),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  code: z.string(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  traceId: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
