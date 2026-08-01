# CineNova Event Taxonomy

## Principles

- Capture the minimum data necessary for product and reliability insights.
- Respect consent, regional privacy policy, and retention rules.
- Never log provider credentials, auth tokens, full signed URLs, raw cookies, or payment card data.

## Initial events

| Event | Required fields | Notes |
| --- | --- | --- |
| `catalogue_rail_impression` | profileId, railId, titleIds, region | Batched client event |
| `search_submitted` | queryLength, region, resultCount | Avoid raw query where privacy setting forbids |
| `title_detail_viewed` | titleId, profileId, region | No source URL |
| `playback_session_requested` | titleId, profileId, deviceId, region | Server event |
| `playback_session_denied` | titleId, denialCodes, region | High-signal rights telemetry |
| `playback_started` | sessionId, titleId, startupMs | Session ID is internal short-lived ID |
| `playback_progress` | sessionId, positionSeconds, durationSeconds | 15-30s cadence |
| `playback_error` | sessionId, safeErrorCode | No provider secrets |
| `download_requested` | titleId, deviceId, region | Server event |
| `download_denied` | titleId, denialCodes | Default-deny observability |
| `billing_webhook_processed` | provider, eventType, idempotencyKey | Safe payload summary only |
| `admin_action` | actorId, action, resourceType, resourceId | Mirrored to audit log |
