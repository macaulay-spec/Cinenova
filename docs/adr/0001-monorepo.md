# ADR 0001: Use a pnpm/Turborepo monorepo

## Status

Accepted

## Context

CineNova needs shared domain policies, contracts, provider adapters, UI components, worker code, and docs
without leaking provider or persistence concerns into the domain.

## Decision

Use pnpm workspaces and Turborepo with separate packages for domain, contracts, provider SDK, UI,
config, and observability.

## Consequences

- Shared code can be tested in isolation.
- Import boundaries are easier to enforce.
- CI can cache per-package work.
- Dependency hygiene is required to prevent packages from becoming coupled.
