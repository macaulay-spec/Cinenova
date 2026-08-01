import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('CineNova'),
  NEXT_PUBLIC_APP_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  CSRF_SECRET: z.string().min(32).optional(),
  PROVIDER_ROUTING: z.enum(['mock', 'gzmovie']).default('gzmovie'),
  GZMOVIE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  GZMOVIE_BASE_URL: z.string().url().default('https://gzmovieboxapi.septorch.tech'),
  GZMOVIE_LEGACY_API_KEY: z.string().optional(),
  GZMOVIE_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  PAYMENT_PROVIDER: z.enum(['mock', 'stripe', 'paystack', 'flutterwave']).default('mock'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type CineNovaEnv = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv): CineNovaEnv {
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid CineNova environment: ${formatted}`);
  }

  const env = parsed.data;
  if (env.NODE_ENV === 'production') {
    const missing = [
      ['DATABASE_URL', env.DATABASE_URL],
      ['REDIS_URL', env.REDIS_URL],
      ['SESSION_SECRET', env.SESSION_SECRET],
      ['CSRF_SECRET', env.CSRF_SECRET],
    ].filter(([, value]) => !value);

    if (missing.length > 0) {
      throw new Error(
        `Production environment is missing mandatory secret/config values: ${missing
          .map(([key]) => key)
          .join(', ')}`,
      );
    }
  }

  return env;
}
