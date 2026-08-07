# CineNova Cost Model

## Cost drivers

- Playback minutes and CDN egress.
- Image transformation/storage and cache hit ratio.
- PostgreSQL read/write volume and backups.
- Redis memory and queue throughput.
- Search indexing/queries if Meilisearch or OpenSearch is adopted.
- Observability ingest volume, trace sampling, and log retention.
- Payment provider fees and webhook/reconciliation jobs.

## Initial controls

- Cache catalogue metadata with explicit TTLs.
- Never cache private session responses publicly.
- Keep analytics payloads small and consent-aware.
- Add cost per playback minute as a business metric.
- Use feature flags for provider routing and experiments.

## Open estimates

A concrete monthly estimate requires selected cloud/CDN region, expected MAU, average playback minutes,
video bitrates, content library size, and observability retention requirements.
