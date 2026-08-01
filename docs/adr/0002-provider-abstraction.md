# ADR 0002: Provider-neutral catalogue and playback ports

## Status

Accepted

## Context

The platform must not depend permanently on a single provider. GZMovie is the active catalogue
backbone; the mock provider remains available as a fallback. Provider credentials are server-only and
kept in a secret manager.

## Decision

Define a `StreamingCatalogProvider` port with mock and future licensed adapters. Public API responses
use normalized contracts only.

## Consequences

- Provider response shapes do not leak to clients.
- Legal/provider disablement is possible through routing flags.
- Each adapter needs validation, health checks, deadlines, and redacted logging.
