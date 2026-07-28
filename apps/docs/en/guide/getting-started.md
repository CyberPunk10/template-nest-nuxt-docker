# Getting started

Two ways to run the project — **pnpm** or **Docker**, each with its own dev/production flavor:

|            | Development                                                                  | Production                                                                                                  |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **pnpm**   | [`pnpm dev`](#pnpm-dev) — everyday development, hot-reload, the fastest path | [`pnpm build`](#pnpm-build-production-build-without-docker) — check the production build without containers |
| **Docker** | not set up — see the note in the [Docker](#docker-—-all-services) section    | [`docker compose up`](#docker-—-all-services) — production stack in containers, as in deployment            |

## Prerequisites

### 1. Node.js ≥ 24

```bash
node -v
```

The version is pinned in `.nvmrc` and `engines` in the root `package.json`. `.npmrc` has `engine-strict=true` — `pnpm install` **refuses** to install dependencies on an unsupported Node version, instead of a silent install that could break later at runtime.

::: details How to install it (nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
```

Then, from the repo root (where `.nvmrc` lives):

```bash
nvm install 24
nvm use 24
```

Details — [nvm-sh/nvm](https://github.com/nvm-sh/nvm).
:::

### 2. pnpm ≥ 11 via Corepack

```bash
pnpm --version
```

The pnpm version is pinned in `packageManager` in the root `package.json` — the recommended way to get it is [Corepack](https://nodejs.org/api/corepack.html), built into Node.js.

::: details How to install it (Corepack)
```bash
corepack enable
```

After this, `pnpm` in this project will be the version specified in `packageManager`. If another pnpm is already installed globally, it may intercept the call before the Corepack shim gets a chance, substituting a different `pnpm` version. Check the version with `pnpm --version`, and if it differs from what's in `packageManager`, see [pnpm and Corepack](/en/guide/pnpm).
:::

### 3. Docker + Docker Compose

```bash
docker --version
docker compose version
```

::: details How to install it
Full instructions for your OS — [docs.docker.com/get-started/get-docker](https://docs.docker.com/get-started/get-docker/).

Quick path for Linux:

```bash
curl -fsSL https://get.docker.com | sh
```
:::

### 4. Docker network

```bash
docker network create template-nest-nuxt_app
```

Only needed for Docker mode, once. The network is declared in `docker-compose.yml` as `external: true` — `docker compose` expects it to already exist and doesn't create it itself. Without this step, `docker compose up` fails with `network ... declared as external, but could not be found`.

### 5. `.env` files

You don't have to copy `.env.example` → `.env` by hand — on first run, the wrapper script does it for you (`pnpm dev` → `predev.mjs`, `pnpm docker:up` → `predocker.mjs`) — both create **all** missing `.env` files: root, `apps/backend`, `apps/frontend`, `apps/docs`.

If you need to create them ahead of time — e.g. before a direct `docker compose up`, bypassing `pnpm docker:up` — there's a dedicated command that does just that:

```bash
pnpm env:copy
```

For details on which variables live where and why — see [ENV variables](/en/guide/env-variables).

## pnpm dev

```bash
pnpm dev
```

One command brings up everything natively, with hot-reload for each service. Before starting, `predev.mjs` runs (see step 5 above): creates `.env` files if they're missing and resolves port conflicts.

| Service  | URL                     | Technology       |
| -------- | ----------------------- | ---------------- |
| Backend  | `http://localhost:3100` | NestJS `--watch` |
| Frontend | `http://localhost:3200` | Nuxt dev         |
| Docs     | `http://localhost:5173` | VitePress dev    |

::: tip
When switching branches, the local `.env` doesn't update automatically — it may be missing variables introduced by the new branch. Compare it against `.env.example` and add whatever's missing.
:::

## pnpm build (production build without Docker)

Check the production build without containers:

```bash
pnpm build

# run backend
cd apps/backend && pnpm start:prod

# run frontend (in another terminal)
cd apps/frontend && node .output/server/index.mjs
```

## Docker — all services

::: info
Production mode only — `docker compose up` always builds and runs production images (multi-stage build, no source volume-mounts). There's no separate Docker dev mode with hot-reload yet — for development, use [`pnpm dev`](#pnpm-dev).
:::

```bash
pnpm docker:up --build
```

`pnpm docker:up` isn't just an alias for `docker compose up`: before starting, `predocker.mjs` runs (see step 5 above) — creates the root `.env` if it's missing, and checks host ports for conflicts, offering to kill the process holding one if there's a clash.

- Backend: `http://localhost:3500` (or `BACKEND_HOST_PORT` from `.env`)
- Frontend: `http://localhost:3600` (or the value of `FRONTEND_HOST_PORT` from `.env`)
- Docs: `http://localhost:3700` (or `DOCS_HOST_PORT` from `.env`)

::: warning
A direct `docker compose up`, bypassing `pnpm docker:up`, also works, but without the prep step — without the root `.env` it refuses to start (`no port specified`), without `apps/*/.env` it also refuses (`env file ... not found`). And if a host port is taken, you'll get a plain Docker `address already in use` error, with no dialog offering to free it up.
:::

For how the port scheme, `env_file`/`environment` overrides, and why `USER node` and `HEALTHCHECK` are needed — see [Docker](/en/guide/docker).

## Stopping

Docker compose:

```bash
docker compose down
```

This doesn't remove the `template-nest-nuxt_app` network — it's `external`, compose didn't create it, so it's not compose's job to remove it. Remove it manually if it's no longer needed:

```bash
docker network rm template-nest-nuxt_app
```

## Docker — service by service

You can build and run `backend`, `frontend`, or `docs` as a standalone container, without `docker compose` — for example, to check a single image in isolation.

See the [Docker](/en/guide/docker) section for the commands to run each service individually.
