# Database Persistence

CineNova's domain data (sessions, profiles, devices, audit logs, users) is
persisted through repository ports defined in `@cinenova/domain`. Two
implementations exist:

- **In-memory** (`@cinenova/domain` `InMemory*Repository`) — per-process,
  non-durable; used for local/demo/test operation.
- **PostgreSQL** (`@cinenova/db` `Prisma*Repository`) — implements the same
  ports against a `DbGateway` bridged to the generated Prisma client.

## Backends

The web app selects its backend via `PERSISTENCE`:

- `PERSISTENCE=memory` (default) — no database required.
- `PERSISTENCE=postgres` — uses the `@cinenova/db` adapters.

## Enabling PostgreSQL

Prerequisites:

1. A reachable PostgreSQL database and `DATABASE_URL` in `.env`.
2. The generated Prisma client.

Steps:

```bash
cd apps/web
npx prisma migrate deploy   # apply the migrations
npx prisma generate         # generate @prisma/client
```

Then set `PERSISTENCE=postgres` in your environment.

The runtime bridge (`buildSessionRepository('postgres')` in
`apps/web/lib/session.ts`) is currently stubbed to throw a clear message until
the generated client is available; completing it is a follow-up. The adapters
themselves are type-checked and unit-tested in `@cinenova/db`.

## What is persisted

| Repository | Domain port          | Prisma model |
| ---------- | -------------------- | ------------ |
| Session    | `SessionRepository`  | `Session`    |
| Profile    | `ProfileRepository`  | `Profile`    |
| Device     | `DeviceRepository`   | `Device`     |
| Audit log  | `AuditLogRepository` | `AuditLog`   |
| User       | `UserRepository`     | `User`       |

## Security notes

- Session records store only the SHA-256 hash of the token (`tokenHash`), never
  the raw token.
- Audit `safeSummary` is JSON and must never contain secrets, provider keys, or
  raw authorization data.
- Provider credentials are never persisted; the provider adapter sends the key
  server-side at request time only.

## See also

- `docs/adr/0008-database-persistence.md`
- `apps/web/prisma/schema.prisma`
- `apps/web/prisma/migrations/`
