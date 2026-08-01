# CineNova SLOs

## Initial service level indicators

| Service | SLI | Target | Notes |
| --- | --- | --- | --- |
| Catalogue API | P95 successful cached response latency | < 300 ms | Primary region, excludes cold starts |
| Search API | P95 response latency | < 600 ms | PostgreSQL FTS initially, search adapter later |
| Playback session | Successful session creation rate | 99.95% | Excludes upstream provider outage tracked separately |
| Playback start | First frame after authorized session | Product metric | Requires client telemetry |
| Admin | Monthly availability | 99.5% | Lower than playback critical path |
| Rights policy | False allow rate | 0 known cases | Any known false allow is a severity-1 incident |

## Error budget policy

- Burn-rate alerts page the owning operator only when actionable and linked to a runbook.
- Feature flags must support immediate rollback of provider routing, experiments, and risky features.
- Rights and security controls are not A/B-tested and are not disabled through client-only flags.

## Initial alerts

- Elevated 5xx on `/api/v1/playback/session`.
- Provider health status degraded/unhealthy.
- Redis queue depth over threshold.
- Database saturation or replication lag.
- Increased `RIGHTS_DENIED` anomalies by region/title after rights changes.
- Log redaction failure or secret scan finding.
