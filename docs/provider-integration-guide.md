# Provider Integration Guide

## Adding a provider

1. Confirm legal rights, contract terms, territories, and offline/download permissions.
2. Add credentials to secret manager; never commit them or expose them as `NEXT_PUBLIC_*`.
3. Implement `StreamingCatalogProvider` in `packages/provider-sdk`.
4. Validate every response with Zod before normalization.
5. Map provider IDs to internal `Title`, `Asset`, and `ContentRight` records.
6. Add health checks, deadlines, retry policy for safe metadata reads, and circuit breaker metrics.
7. Add redacted logs and provider dashboards.
8. Keep provider source URLs short-lived and out of the database.
9. Add integration tests with mocked provider failures.
10. Roll out behind a server-side feature flag.

## GZMovie boundary

GZMovie is optional, server-only, and disabled by default:

```env
PROVIDER_ROUTING=mock
GZMOVIE_ENABLED=false
```

Only documented routes may be used, and proxy/download routes must remain provider transport internals,
not browser-accessible generic endpoints.
