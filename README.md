# CineNova

CineNova is a production-oriented, rights-aware streaming platform foundation. This repository is being built from the included master build prompt and visual design board.

## Current implementation status

This first milestone creates the application foundation:

- Turborepo + pnpm workspace structure
- Next.js App Router web app with a cinematic responsive UI shell
- Domain package for rights, entitlement, RBAC, playback, and download policy decisions
- Contracts package with Zod API schemas
- Provider SDK with GZMovie as the active catalogue backbone and a mock licensed provider fallback
- Prisma schema and initial SQL migration for the core data model
- Docker Compose for Postgres, Redis, mail mock, web, and worker services
- OpenAPI, ADRs, threat model, SLOs, launch checklist, and runbooks
- Unit tests for policy, redaction, session, and CSRF logic
- Identity/profile/RBAC foundation with request-scoped active profile policy
- Server-side session + CSRF boundary (hashed tokens, repository ports, in-memory adapter) protecting all mutations
- Session hardening: active token rotation on idle and concurrent-session limits
- PostgreSQL persistence adapters (`@cinenova/db`) implementing the repository ports

## Legal and security stance

CineNova uses GZMovie as its active catalogue backbone and denies playback/downloads unless rights and entitlement checks pass (the mock provider is the fallback for local development). The app must never expose provider keys, signed provider URLs, cookies, or authorization headers to browser bundles, logs, analytics, database records, or error responses. GZMovie credentials are server-only and stored in a secret manager.

## Local setup

```bash
npx pnpm@9.15.4 install
cp .env.example .env
npx pnpm@9.15.4 dev
```

The web app runs at <http://localhost:3000>.

## Useful commands

```bash
npx pnpm@9.15.4 lint
npx pnpm@9.15.4 typecheck
npx pnpm@9.15.4 test
npx pnpm@9.15.4 build
```

## Repository guide

```text
apps/web                 Next.js client/BFF and route handlers
apps/worker              background worker placeholder
packages/ui              design system components
packages/domain          domain entities, policies, and errors
packages/contracts       Zod schemas and typed API contracts
packages/provider-sdk    provider ports, GZMovie adapter (active), mock provider fallback
packages/db              PostgreSQL repository adapters (session/profile/device/audit/user)
packages/config          environment validation
packages/observability   structured logger and redaction helpers
infra/                   Docker, Kubernetes, and Terraform templates
docs/                    ADRs, architecture, API, security, SLOs, runbooks
```

See `docs/architecture.md`, `docs/identity-and-profiles.md`, `docs/session-and-csrf.md`, and `docs/assumptions-and-dependencies.md` before enabling real providers, billing, or DRM.
