# ADR-0008: Database Persistence Layer

- **Status:** Accepted
- **Date:** 2026-08-02
- **Related:** ADR-0007 (session/CSRF), ADR-0001 (monorepo), ADR-0006 (identity)

## Context

The session, profile, device, audit, and user data were backed by in-memory
adapters, so they reset on restart and could not serve production. We need a
real persistence boundary. The Prisma engine could not be downloaded in the
authoring environment, so a generated `@prisma/client` was not available to
typecheck or run against during this milestone.

## Decision

1. **Repository ports stay the single contract.** `SessionRepository`,
   `ProfileRepository`, `DeviceRepository`, `AuditLogRepository`, and
   `UserRepository` in `@cinenova/domain` are unchanged. Callers depend on the
   ports, never on a concrete store.

2. **A new `@cinenova/db` package provides PostgreSQL adapters.** It contains:

   - a `DbGateway` interface mirroring the subset of Prisma model accessors
     used by the adapters;
   - `Prisma*Repository` classes that implement the domain ports against a
     `DbGateway`;
   - row mappers translating Prisma rows to domain records;
   - `dbGatewayFromPrisma(client)` that bridges a generated Prisma client to the
     `DbGateway` shape.

   Because the adapters depend on the `DbGateway` interface rather than the
   generated client, they typecheck and are unit-tested without a generated
   client.

3. **Schema fields were added for the adapters.** `Session` gains `profileId`,
   `lastSeenAt`, `ip`, and `userAgent`; `Profile` gains `avatarInitial`. A
   migration is provided (`20260802000000_session_profile_fields`).

4. **The web app keeps the in-memory default.** `PERSISTENCE=memory` is the
   default so local/demo operation works without a database. Production sets
   `PERSISTENCE=postgres`, which requires `npx prisma generate` from `apps/web`
   and a reachable database; a runtime bridge is stubbed and documented.

## Consequences

- Callers of the repository ports are unchanged when switching from memory to
  PostgreSQL — only the wiring changes.
- The `@cinenova/db` package is type-checked and unit-tested in CI.
- The web app does not yet depend on a live database for local operation.
- A follow-up is required to generate the Prisma client in an environment that
  can download engines and to wire `buildSessionRepository('postgres')` plus
  the other adapters into the web app runtime.

## Alternatives considered

- **Wire Prisma into the web app now:** deferred because the generated client
  could not be produced in this environment; the port interface makes the
  later swap additive and safe.
- **Skip the persistence boundary and hard-code a database:** rejected; the
  ports keep policy and storage decoupled and testable.
