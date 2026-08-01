# Runbook: Rights Denial Anomaly

## Trigger

A title, region, or plan has an unexpected spike or drop in `RIGHTS_DENIED`, `PROFILE_RESTRICTED`,
or download-unavailable events.

## Steps

1. Freeze related rights/editorial changes if a rollout is in progress.
2. Compare active `ContentRight` rows against approved rights documentation.
3. Run unit tests for policy changes and a manual smoke test for affected territory/profile/plan.
4. If a false allow is suspected, treat as severity 1 and disable the affected title/provider route.
5. If a false deny is confirmed, repair rights metadata, clear relevant caches, and notify support.
6. Add a regression test for the policy or migration error.
