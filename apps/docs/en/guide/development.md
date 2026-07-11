# Development

The project has **two independent run modes**. They are not the same and solve different problems — it's important not to confuse them.

## Requirements

- **Node.js ≥ 24** and **pnpm ≥ 11** (see `engines` in the root `package.json`).
- The repository root has an [`.nvmrc`](https://github.com/nvm-sh/nvm#nvmrc) pinned to `24` — if you have nvm/fnm/asdf installed, run `nvm use` (or enable auto-switch) so you don't have to track the version manually.
- `.npmrc` sets `engine-strict=true` — `pnpm install` will **refuse** to install dependencies on a mismatched Node version instead of silently installing something that could break at runtime later.
- The pnpm version is pinned via `packageManager` in `package.json` — with [corepack](https://nodejs.org/api/corepack.html) enabled it's picked up automatically, no manual install needed.

|                              | Development mode                    | Production mode                        |
| ---------------------------- | ----------------------------------- | -------------------------------------- |
| Command                      | `pnpm dev`                          | `docker compose up`                    |
| Code (backend/frontend/docs) | native, with HMR                    | built into Docker images               |
| Database                     | PostgreSQL in Docker                | PostgreSQL in Docker                   |
| Access                       | directly: `:3000`, `:3001`, `:5173` | through Docker                         |
| Edit speed                   | instant (hot reload)                | image rebuild                          |

## Why NOT Docker for development

Docker images build a **production artifact** (`pnpm build`). Any code change would require rebuilding the image — that's tens of seconds per edit, with no hot reload and no convenient debugging.

That's why in dev the code runs **natively** via `pnpm dev`, and Docker only spins up what's inconvenient to install natively — the **database**.

This separation is standard practice: locally you run code natively for speed, and you build Docker only for the production image and deployment.

## Development mode

```bash
pnpm dev
```

A single command spins up everything you need. Before starting, [`predev.mjs`](/en/guide/env-variables#predev-mjs) runs:

1. creates `.env` from `.env.example` if they're missing;
2. resolves port conflicts;
3. **starts PostgreSQL** (`docker-compose.dev.yml`) if the container isn't running yet.

Then `dev.mjs` launches three processes natively, each with its own hot reload:

| Service  | URL                     | Technology       |
| -------- | ----------------------- | ---------------- |
| Backend  | `http://localhost:3001` | NestJS `--watch` |
| Frontend | `http://localhost:3000` | Nuxt dev         |
| Docs     | `http://localhost:5173` | VitePress dev    |

The database starts once and lives with a persistent volume (`postgres_data`) — data isn't lost between runs. There's no need to stop it between sessions.

Start/stop the database manually (usually not required — `predev` handles it):

```bash
docker compose -f docker-compose.dev.yml up -d   # start
docker compose -f docker-compose.dev.yml down     # stop (data is preserved in the volume)
```

## Production mode

```bash
docker compose up --build
```

Builds and runs the full stack in Docker.
