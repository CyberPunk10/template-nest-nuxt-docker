# Database: PostgreSQL + Prisma

> **Branch:** this documentation applies only to the `postgres-prisma` branch.

## Stack

- **PostgreSQL 17** — spun up via Docker in dev mode
- **Prisma 7** — ORM, migrations, client generation

---

## Running locally

> **When switching branches**, your local `.env` is not updated automatically — it may be missing variables required by the new branch. Compare it against `.env.example` and add whatever is missing. For example, when switching from `main` to `postgres-prisma`, the `POSTGRES_*` variables may be absent from `apps/backend/.env`. Copy them from `apps/backend/.env.example`.

Spin up PostgreSQL via Docker:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Apply migrations and generate the client:

```bash
cd apps/backend
pnpm prisma migrate dev
```

---

## Configuration

### `apps/backend/.env`

Database connection parameters for Prisma and the application:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=template
```

### Root `.env`

Parameters for Docker Compose:

```
POSTGRES_PORT=5432
```

### Changing the port

If port 5432 is already in use, you need to change it in **two places**:

1. `apps/backend/.env` — `POSTGRES_PORT=5435`
2. Root `.env` — `POSTGRES_PORT=5435`

The first is read by Prisma, the second is read by Docker Compose when mapping the port from the host into the container.

---

## Prisma

### Structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma       ← models
│   └── migrations/         ← migration history (committed to git)
└── prisma.config.ts        ← Prisma configuration (datasource URL)
```

### Core commands

All commands are run from `apps/backend/`:

```bash
cd apps/backend

# create and apply a migration
pnpm prisma migrate dev --name <name>

# apply migrations without creating new ones (CI / production)
pnpm prisma migrate deploy

# open Prisma Studio (GUI for viewing and editing data)
pnpm prisma studio
# → http://localhost:5555

# regenerate the client manually
pnpm prisma generate
```

### Client generation

Prisma generates the client into `src/generated/prisma` — this folder is in `.gitignore`.
In Prisma 7 the client is **not generated automatically** on `migrate dev` — you need to run `prisma generate` manually after schema changes. Auto-generation can be configured via `afterApply` in `prisma.config.ts`.

---

## Migrations

The `prisma/migrations/` folder is committed to git — it is the history of database schema changes.
Never edit migration files by hand.

For production, use `prisma migrate deploy` — it applies only pending migrations, with no interactive prompts.

---

## Resolving drift between the schema and the generated client

### How the problem arises

Prisma works with two independent artifacts:

1. **Migration history** — the files in `prisma/migrations/`, committed to git.
2. **Generated client** — the TypeScript code in `src/generated/prisma/`, not committed (in `.gitignore`).

The client is generated from the actual state of the database at the moment of `prisma migrate dev`. If a migration has been applied to the database but its file is missing from `migrations/` — for example, it was created on another machine or in another branch and never made it into git — then the client will contain fields and models that do not exist in `schema.prisma`. The result: TypeScript errors on fields that aren't in the code.

You can spot this situation in the `migrate dev` output:

```
Drift detected: Your database schema is not in sync with your migration history.
The following migration(s) are applied to the database but missing from the local migrations directory: 20260607165435_add_auth
```

### Fix for the dev environment

You need to reset the database to the state described by the current migration files and rebuild the client:

```bash
cd apps/backend

# 1. Reset the database and re-apply migrations (all data will be lost)
pnpm prisma migrate reset

# 2. Regenerate the client from the current schema.prisma
pnpm prisma generate
```

> `migrate reset` does not run `generate` automatically — the client must be rebuilt separately.
> After this, the TypeScript errors on "nonexistent" fields will disappear.

### When this approach doesn't work

If the drift occurred in **production** or in an environment with data you cannot afford to lose, `migrate reset` is not acceptable. In that case you need to either restore the lost migration file from the git history of another branch or machine, or use `prisma migrate resolve` to manually reconcile the state.

---

## Prisma error codes

Prisma normalizes PostgreSQL errors into its own codes via `PrismaClientKnownRequestError`. This lets you handle errors without parsing the driver's text messages.

The most common codes:

| Code    | Meaning                                                     | Typical response                    |
| ------- | ----------------------------------------------------------- | ----------------------------------- |
| `P2002` | Unique constraint violation (e.g. email already taken)      | `409 Conflict`                      |
| `P2025` | Record not found on `update`, `delete`, `findUniqueOrThrow` | `404 Not Found`                     |
| `P2003` | Foreign key constraint violation                            | `409 Conflict` or `400 Bad Request` |

The idiomatic pattern is to go straight for `update`/`delete` and catch P2025, instead of a preliminary `findUniqueOrThrow`.

::: tip TOCTOU (Time-Of-Check Time-Of-Use)
A class of bugs where there is a window between checking a condition and acting on it in which the state can change. Here: between `findUniqueOrThrow` (the check) and `update`/`delete` (the use), another process manages to delete the record.
:::

❌ **Two queries with a TOCTOU window:**

```typescript
// Query 1: check that the record exists
await this.prisma.user.findUniqueOrThrow({ where: { id } }).catch(() => {
  throw new NotFoundException() // handled
})
// ← another process may delete the record here
// Query 2: update — throws an unhandled P2025 → 500
return await this.prisma.user.update({ where: { id }, data: dto })
```

✅ **One query, P2025 handled explicitly:**

```typescript
try {
  return await this.prisma.user.update({ where: { id }, data: dto })
} catch (e) {
  if (e instanceof PrismaClientKnownRequestError) {
    if (e.code === 'P2025') throw new NotFoundException()
    if (e.code === 'P2002') throw new ConflictException()
  }
  throw e
}
```

This eliminates the TOCTOU window between the two queries and halves the number of database round-trips.

Full list of codes: [Prisma Error Reference](https://www.prisma.io/docs/orm/reference/error-reference)
