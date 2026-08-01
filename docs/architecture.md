# CineNova Architecture

## Executive summary

CineNova is structured as a rights-aware streaming platform with a Next.js web/BFF application, clean domain packages, provider adapters, typed API contracts, and infrastructure-ready operational boundaries. The first milestone intentionally uses mock licensed content and controlled sample media while preserving the security rules required for real providers.

## System context

```text
Users / browsers / PWA
        |
        v
apps/web (Next.js App Router + route handlers)
        |
        +--> packages/domain        policy decisions: rights, entitlement, RBAC, download limits
        +--> packages/contracts     Zod request/response contracts
        +--> packages/provider-sdk  GZMovie adapter (active), MockLicensedProvider (fallback)
        +--> packages/ui            cinematic accessible design system
        +--> packages/observability structured logs and redaction
        |
        +--> PostgreSQL / Prisma    source of truth for users, catalogue, rights, progress, audit
        +--> Redis / queues         rate limits, sessions, feature flag cache, BullMQ jobs
        +--> Object storage / CDN   artwork and licensed media distribution when configured
```

## Monorepo boundaries

- `apps/web`: public web client, BFF, route handlers, Prisma schema, and initial UI flows.
- `apps/worker`: queue worker placeholder for catalogue sync, rights expiry, billing webhooks, data deletion.
- `packages/domain`: pure TypeScript domain policies. It does not import HTTP, Prisma, Next, or provider code.
- `packages/contracts`: Zod schemas used at API boundaries.
- `packages/provider-sdk`: provider ports and adapters. Provider response shapes do not leak to public APIs.
- `packages/ui`: reusable accessible UI components and Storybook scaffold.
- `packages/config`: environment validation with production fail-fast rules.
- `packages/observability`: JSON logging and secret/signed URL redaction.
- `infra`: Docker, Kubernetes, and Terraform templates.
- `docs`: ADRs, OpenAPI, SLOs, runbooks, threat model, and launch materials.

## Request flow: playback session

1. Client requests title detail or opens `/watch/[id]`.
2. Server resolves the title through the provider port.
3. Server builds a principal/entitlement/profile context.
4. Domain policy evaluates title rights by territory, window, plan, profile maturity, operation, and asset.
5. If denied, API returns a safe RFC 7807-like problem response.
6. If allowed, server resolves a fresh media manifest from the provider adapter.
7. Server validates HTTPS and approved host allowlist.
8. Server returns a short-lived internal playback session response.
9. Player UI shows DRM truthfully: mock provider has `drmActive=false`.

## Provider strategy

GZMovie is the active catalogue backbone wired to the public UI/API routes. The provider adapter
normalizes GZMovie's documented responses onto CineNova contracts and enforces rights server-side.
The mock licensed provider remains available as a fallback (`PROVIDER_ROUTING=mock`) for local
development and tests. Provider credentials live in a secret manager and are never exposed client-side.

## Data strategy

PostgreSQL/Prisma is the source of truth. Redis is used only for ephemeral cache, queues, sessions/rate limits where appropriate, and short-lived playback/download session metadata. Analytics events are isolated and can later move to a warehouse or event stream.

## Security baseline

- Default deny for playback/download.
- Provider keys and signed URLs are redacted from logs and never stored.
- CSP/HSTS hardening is planned; core security headers are scaffolded.
- API requests are validated with Zod.
- Domain policy tests protect high-risk rights logic.
- No generic proxy or downloader routes are exposed.
