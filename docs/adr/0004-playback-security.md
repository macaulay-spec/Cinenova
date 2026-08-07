# ADR 0004: Short-lived server-issued playback sessions

## Status

Accepted

## Context

The browser must not provide arbitrary media URLs or receive provider credentials/signed provider data.

## Decision

Playback session creation occurs server-side after rights evaluation and source host validation. Session
responses are `Cache-Control: no-store` and include a truthful DRM status.

## Consequences

- No generic proxy/downloader route is built.
- Future provider manifests must be short-lived and never persisted.
- Client playback errors should be safe and accessible.
