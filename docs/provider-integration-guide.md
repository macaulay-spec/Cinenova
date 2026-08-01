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

GZMovie is the active catalogue backbone. It is server-only and uses only its documented routes:

```env
PROVIDER_ROUTING=gzmovie
GZMOVIE_ENABLED=true
```

The adapter normalizes documented responses (`/api/homepage`, `/api/search`, `/api/item-details`,
`/api/recommendations`, `/api/media`) into CineNova contracts with Zod validation. The provider API key
is sent server-side only and never appears in client responses. Proxy/download routes remain provider
transport internals, not browser-accessible generic endpoints.

Mock (`PROVIDER_ROUTING=mock`) remains available as a fallback for local development and tests.

### Rights derivation

GZMovie-normalized titles carry their availability window, minimum plan, and country list. The
`rightsFromTitle` helper in `@cinenova/domain` builds the `ContentRight` that the same strict rights
engine evaluates, so rights enforcement holds identically over real provider data.
