import { parseEnv } from '@cinenova/config';
import {
  FallbackCatalogueProvider,
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
  const mock = new MockLicensedProviderAdapter();

  if (env.PROVIDER_ROUTING === 'gzmovie') {
    const gzMovieConfig = {
      enabled: env.GZMOVIE_ENABLED,
      baseUrl: env.GZMOVIE_BASE_URL,
      timeoutMs: env.GZMOVIE_REQUEST_TIMEOUT_MS,
    };

    const gzMovie = new GZMovieProviderAdapter(
      env.GZMOVIE_LEGACY_API_KEY
        ? { ...gzMovieConfig, apiKey: env.GZMOVIE_LEGACY_API_KEY }
        : gzMovieConfig,
    );

    // Serve real ZST LABS catalogue when reachable; fall back to the mock
    // licensed catalogue so the UI is never blank/warming-up when the
    // provider is down or the key is invalid.
    provider = new FallbackCatalogueProvider({ primary: gzMovie, fallback: mock });
    return provider;
  }

  provider = mock;
  return provider;
}
