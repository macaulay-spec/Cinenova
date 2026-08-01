# ADR 0005: PostgreSQL first, search adapter later

## Status

Accepted

## Context

CineNova needs durable relational data and search. Early scale does not justify a separate search cluster.

## Decision

Use PostgreSQL/Prisma as the source of truth. Start with simple mock/provider search and plan PostgreSQL
FTS before adding Meilisearch/OpenSearch behind an adapter.

## Consequences

- Local development is simpler.
- Search telemetry should be added before tuning ranking.
- Heavy analytics can later move to partitions or a warehouse.
