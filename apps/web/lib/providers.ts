import { parseEnv } from '@cinenova/config';
import {
  GZMovieProviderAdapter,
  MockLicensedProviderAdapter,
  type StreamingCatalogProvider,
} from '@cinenova/provider-sdk';

let provider: StreamingCatalogProvider | null = null;

export function getCatalogProvider(): StreamingCatalogProvider {
  if (provider) {
    return provider;
  }

  const env = parseEnv(process.env);

  if (env.PROVIDER_ROUTING === 'gzmovie') {
    const gzMovieConfig = {
      enabled: env.GZMOVIE_ENABLED,
      baseUrl: env.GZMOVIE_BASE_URL,
      timeoutMs: env.GZMOVIE_REQUEST_TIMEOUT_MS,
    };

    provider = new GZMovieProviderAdapter(
      env.GZMOVIE_LEGACY_API_KEY
        ? { ...gzMovieConfig, apiKey: env.GZMOVIE_LEGACY_API_KEY }
        : gzMovieConfig,
    );
    return provider;
  }

  provider = new MockLicensedProviderAdapter();
  return provider;
}
