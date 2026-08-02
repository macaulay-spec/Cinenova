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

## ZST LABS (GZMovie) boundary

ZST LABS is the active catalogue backbone (base URL `https://zstlab.cyou`). It is server-only and uses
only its documented routes:

```env
PROVIDER_ROUTING=gzmovie
GZMOVIE_ENABLED=true
GZMOVIE_BASE_URL=https://zstlab.cyou
GZMOVIE_LEGACY_API_KEY=your-zst-api-key
```

The adapter sends the key via the `x-api-key` header (server-side only) and normalizes documented
responses (`/api/homepage`, `/api/search`, `/api/item-details`, `/api/recommendations`, `/api/media`,
`POST /api/stream`) into CineNova contracts with Zod validation. Titles are keyed by `subjectId` and
`detailPath` (used as the CineNova id and slug respectively). Streaming source URLs are signed and
short-lived mp4s on an approved CDN; they are validated for HTTPS + approved host and never persisted.

The API key must live in a secret manager / local `.env` and never in git, logs, error responses, or
browser bundles. `GZMOVIE_LEGACY_API_KEY` is kept as the env name for compatibility.

Mock (`PROVIDER_ROUTING=mock`) remains available as a fallback for local development and tests.

### Rights derivation

GZMovie-normalized titles carry their availability window, minimum plan, and country list. The
`rightsFromTitle` helper in `@cinenova/domain` builds the `ContentRight` that the same strict rights
engine evaluates, so rights enforcement holds identically over real provider data.
