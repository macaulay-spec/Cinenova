# Runbook: Provider Outage

## Symptoms

- `/api/v1/admin/provider-health` returns `degraded` or `unhealthy`.
- Playback session creation failures increase.
- Catalogue sync queue backlog grows.

## Immediate actions

1. Confirm whether the issue affects mock provider, GZMovie, or a future licensed provider.
2. Disable affected provider routing with the server-side feature flag or environment value.
3. Confirm public UI falls back to cached/editorial/mock-safe content where legal.
4. Verify playback does not route around rights restrictions or use undocumented endpoints.
5. Post status update for support and incident channel.

## Diagnostics

- Check provider latency/error-rate dashboard.
- Inspect redacted logs using request IDs.
- Verify DNS, TLS, egress, and secret rotation status.
- Check queues and retry/DLQ counts.

## Recovery

- Re-enable provider only after health checks recover and error budget owner approves.
- Run a rights-policy smoke test and playback session smoke test.
- Record timeline, customer impact, root cause, and follow-up actions.
