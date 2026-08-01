# ADR 0003: Centralize rights and entitlement decisions in the domain package

## Status

Accepted

## Context

Playback and downloads are legally sensitive. UI visibility is insufficient as an enforcement layer.

## Decision

Place rights, plan, profile maturity, territory, operation, and asset checks in pure TypeScript domain
policies with unit tests.

## Consequences

- Every API can reuse the same policy logic.
- Policy can be tested without HTTP, Prisma, or provider dependencies.
- Future changes must include regression tests for false allow/deny scenarios.
