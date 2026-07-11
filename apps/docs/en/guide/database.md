# Database: PostgreSQL + Prisma

## Stack

- **PostgreSQL 17** — started via Docker in dev mode
- **Prisma 7** — ORM, migrations, client generation

---

## Local setup

Start PostgreSQL via Docker:

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

DB connection parameters for Prisma and the app:

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

If port 5432 is taken, it needs to be changed in **two places**:

1. `apps/backend/.env` — `POSTGRES_PORT=5435`
2. Root `.env` — `POSTGRES_PORT=5435`

The first is read by Prisma, the second by Docker Compose when proxying the port from host to container.

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

### Main commands

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
The client is generated automatically on `migrate dev`, but it can also be generated manually via `prisma generate`.

---

## Migrations

The `prisma/migrations/` folder is committed to git — it's the history of DB schema changes.
Never edit migration files by hand.

For production, use `prisma migrate deploy` — it applies only pending migrations without interactive prompts.

---

## Resolving drift between the schema and the generated client

### How the problem arises

Prisma works with two independent artifacts:

1. **Migration history** — files in `prisma/migrations/`, committed to git.
2. **Generated client** — TypeScript code in `src/generated/prisma/`, not committed (in `.gitignore`).

The client is generated from the actual DB state at the moment of `prisma migrate dev`. If a migration was applied to the DB whose file is missing from `migrations/` — for example, created on another machine or branch and never committed — the client will contain fields and models that don't exist in `schema.prisma`. The result: TypeScript errors on fields that don't exist in the code.

The telltale sign in `migrate dev` output:

```
Drift detected: Your database schema is not in sync with your migration history.
The following migration(s) are applied to the database but missing from the local migrations directory: 20260607165435_add_auth
```

### Fix for dev environments

Reset the DB to the state described by the current migration files, and rebuild the client:

```bash
cd apps/backend

# 1. Reset the DB and reapply migrations (all data will be deleted)
pnpm prisma migrate reset

# 2. Regenerate the client from the current schema.prisma
pnpm prisma generate
```

> `migrate reset` doesn't run `generate` automatically — the client needs to be rebuilt separately.
> After this, TypeScript errors on "nonexistent" fields will disappear.

### When this approach doesn't work

If the drift occurred in **production** or in an environment with data that can't be lost, `migrate reset` is not acceptable. In that case, either recover the lost migration file from another branch's or machine's git history, or use `prisma migrate resolve` to manually reconcile the state.
