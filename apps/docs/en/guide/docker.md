# Docker

The project has three independent `Dockerfile`s (`backend`, `frontend`, `docs`) and one `docker-compose.yml` that brings all three up as a single stack.

Each `Dockerfile` is multi-stage: the `builder` stage installs dependencies and builds the production artifact, the `runner` stage is a lightweight final image without sources or dev dependencies.

## apps/backend

Builds NestJS into `dist/`, deploys via `pnpm deploy --prod` — the resulting image contains only production `node_modules` and the built code, without `pnpm`/sources.

Run all the following commands **from the monorepo root** (no need to `cd` into `/apps/backend`).

Build the image

```bash
docker build -f apps/backend/Dockerfile -t backend-preview .
```

Run the container on port 3100

```bash
docker run -d -p 3100:3100 \
  -e PORT=3100 \
  -e CORS_ORIGIN_SCHEME_HOST=http://localhost \
  -e CORS_ORIGIN_PORT=3200 \
  --name backend-preview backend-preview
```

Check it:

```bash
curl http://localhost:3100/health
```

Stop and remove:

```bash
docker stop backend-preview
docker rm backend-preview
docker rmi backend-preview
```

## apps/frontend

Builds Nuxt into `.output/` (Nitro standalone server — already includes everything needed to run, no separate `node_modules` is copied).

Run all the following commands **from the monorepo root** (no need to `cd` into `/apps/frontend`).

Build the image

```bash
docker build -f apps/frontend/Dockerfile -t frontend-preview .
```

Run the container on port 3200

```bash
docker run -d -p 3200:3200 \
  -e PORT=3200 \
  -e NUXT_PUBLIC_API_BASE=/api/backend \
  -e NUXT_PUBLIC_BACKEND_PORT=3100 \
  -e NUXT_BACKEND_URL=http://localhost:3100 \
  --name frontend-preview frontend-preview
```

Check it:

```bash
curl http://localhost:3200/api/health
```

Or open: [http://localhost:3200](http://localhost:3200)

::: warning
Run this way, separately from `backend`, frontend won't be able to proxy API requests — unless the backend container is up and reachable at `NUXT_BACKEND_URL`. To properly check the whole setup, bring both up via [docker compose](#docker-compose) or put both containers on the same Docker network.
:::

Stop and remove:

```bash
docker stop frontend-preview
docker rm frontend-preview
docker rmi frontend-preview
```

## apps/docs

VitePress static output, served by `nginx`.

The port inside the container is set via the **`PORT`** variable (defaults to `5173`, see `apps/docs/.env.example`) — the same way as `backend`/`frontend`, but the mechanics inside differ: `nginx` doesn't read environment variables on its own. `apps/docs/nginx.conf.template` isn't a ready-made config, but a template with `listen ${PORT};`; the built-in entrypoint script of the `nginx:alpine` image finds `*.template` files in `/etc/nginx/templates/` on its own, runs them through `envsubst`, and puts the result into `/etc/nginx/conf.d/` — before `nginx` itself starts.

Run all the following commands **from the monorepo root** (no need to `cd` into `/apps/docs`).

Build the image

```bash
docker build -f apps/docs/Dockerfile -t docs-preview .
```

Run the container on port 5173

```bash
docker run -d -p 5173:5173 -e PORT=5173 --name docs-preview docs-preview
```

Check it: [http://localhost:5173](http://localhost:5173)

Stop and remove:

```bash
docker stop docs-preview
docker rm docs-preview
docker rmi docs-preview
```

## docker compose

`docker-compose.yml` brings up `backend`, `frontend`, and `docs` together, on a shared network.

### `env_file` and overrides

`backend`, `frontend`, and `docs` load their own `apps/*/.env` via `env_file:` — the same file used by `pnpm dev`.

```yaml
backend:
  env_file: apps/backend/.env
```

`.env` files are required — without them `docker compose up` refuses to start (`env file ... not found`).

Sometimes a value needs to **differ** for Docker — for example, `NUXT_BACKEND_URL`: in `apps/frontend/.env` it's `http://localhost:3100` (correct for `pnpm dev`, where everything runs on the host), but inside the Docker network, `localhost` for the frontend container means the container itself, not backend. For cases like this, `environment:` in `docker-compose.yml` **explicitly overrides** the value from the file — `environment:` always wins over `env_file:`:

```yaml
frontend:
  env_file: apps/frontend/.env
  environment:
    NUXT_BACKEND_URL: http://backend:3100   # overrides localhost:3100 from .env
```

For more on which variables match and which get overridden — see [ENV variables](/en/guide/env-variables).

### Host ports, internal port, and why there are two

There are two independent ports per service here, and mixing them up is a common cause of "the container started but doesn't respond":

| What                                        | Variable                                                                | Where it lives | Who reads it                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| Host port (outside Docker)                  | `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT`             | `.env` (root)  | only `docker-compose.yml`, the left side of `ports:`                                                 |
| Internal port (what the process listens on) | `BACKEND_INTERNAL_PORT`, `FRONTEND_INTERNAL_PORT`, `DOCS_INTERNAL_PORT` | `.env` (root)  | `docker-compose.yml` — in two places at once: the right side of `ports:` **and** `environment: PORT` |

Why the internal port isn't read straight from `apps/backend/.env` (which already has `PORT`) but from a separate variable in the root `.env`: `ports:` is resolved by Compose **while reading the YAML**, before the container starts, while `env_file:` only passes the file's contents **into** the container at startup. These are two different points in time — Compose physically can't substitute into `ports:` something that lives in `apps/backend/.env`. The only way to guarantee both halves (`ports:` and the `PORT` passed inside) match is to take them from one source visible to Compose at interpolation time. Hence `environment: PORT` in `docker-compose.yml` explicitly overrides the `PORT` that would otherwise come from `apps/*/.env` via `env_file:`.

```yaml
backend:
  ports:
    - '${BACKEND_HOST_PORT}:${BACKEND_INTERNAL_PORT}'
  env_file: apps/backend/.env
  environment:
    PORT: '${BACKEND_INTERNAL_PORT}'   # overrides PORT from .env
```

If you only change `PORT` in `apps/backend/.env`, without touching `BACKEND_INTERNAL_PORT` in the root `.env` — nothing breaks: `environment:` still wins and substitutes the value from `BACKEND_INTERNAL_PORT`, not the one in the file. To actually change the port the container listens on, you need to change `BACKEND_INTERNAL_PORT`/`FRONTEND_INTERNAL_PORT`/`DOCS_INTERNAL_PORT` in the root `.env` — those are the ones that both land in `PORT` inside the container and determine where Docker proxies the host port to.

For `docs` it works the same way, but `nginx` doesn't read `PORT` on its own — see [envsubst and nginx.conf.template](#apps-docs) above.

### All .env files are required

Without the root `.env`, `docker compose up` refuses to start — without the port variables, Compose can't resolve `ports:` (`no port specified`). Without `apps/backend/.env`/`apps/frontend/.env`/`apps/docs/.env` — it also refuses, with an `env file ... not found` error (`env_file:`). Neither is silently filled in with defaults — that's a deliberate choice, not forgotten defaults.

Create all missing `.env` files with one command, without touching ports or starting Docker itself:

```bash
pnpm env:copy
```

### Running via `pnpm docker:up`

```bash
pnpm docker:up
```

Not just an alias for `docker compose up` — `scripts/predocker.mjs` runs automatically first (via the npm `pre*` convention, mirroring [`predev.mjs`](/en/guide/scripts#predev-mjs-predocker-mjs) for `pnpm dev`):

1. Copies from `.env.example` any missing `.env` files — root, `apps/backend`, `apps/frontend`, `apps/docs` (the same `copyEnvFiles()` used by `pnpm env:copy`)
2. Checks whether `BACKEND_HOST_PORT`/`FRONTEND_HOST_PORT`/`DOCS_HOST_PORT` are already taken on the host — on conflict, offers a dialog: kill the process holding the port or abort the run

A direct `docker compose up` (bypassing `pnpm docker:up`) without the required `.env` files will fail — this command doesn't create `.env` files or check for port conflicts itself. If `.env` files already exist (e.g. via `pnpm env:copy`) but a port has since been taken by something else — `docker compose up` won't warn about it, it'll just refuse to start that particular service with a plain Docker `address already in use` error.

The host ports (`3500`/`3600`/`3700`) in `.env.example` are deliberately not `3000`/`3001` — those are the most common defaults for many Node frameworks (Next.js, Create React App, Nuxt itself in dev mode), so a conflict with another already-running project is otherwise nearly guaranteed. If a host port is still taken by something else (not what `predocker.mjs` offers to kill) — edit only `.env`, not `docker-compose.yml`, for example:

```bash
# in .env:
BACKEND_HOST_PORT=4500
```

::: tip
`NUXT_PUBLIC_BACKEND_PORT` (used only for the backend link shown in DevPanel, not for requests) is overridden in `docker-compose.yml` with the value of `${BACKEND_HOST_PORT}` — when you change the backend's host port, you don't need to manually update this variable too, it's already tied to the same source.
:::

### The network — an important prerequisite

The `template-nest-nuxt_app` network is declared as `external: true` — `docker compose` **doesn't create** it itself, it expects it to already exist. If the network doesn't exist yet:

```bash
docker network create template-nest-nuxt_app
```

Without this step, `docker compose up` fails with `network ... declared as external, but could not be found`.

### Starting

Run all the following commands **from the monorepo root**.

```bash
docker compose up --build
```

- Backend: `http://localhost:3500` (or `BACKEND_HOST_PORT`)
- Frontend: `http://localhost:3600` (or `FRONTEND_HOST_PORT`)
- Docs: `http://localhost:3700` (or `DOCS_HOST_PORT`)

### Stopping

```bash
docker compose down
```

This doesn't remove the `template-nest-nuxt_app` network (it's `external`, compose didn't create it — so it's not compose's job to remove it either). Remove it manually if it's no longer needed:

```bash
docker network rm template-nest-nuxt_app
```

## Extra: unprivileged user

The `backend` and `frontend` runner stages run as `USER node` — the unprivileged user already built into the `node:*-alpine` image, no need to create one separately:

```dockerfile
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder --chown=node:node /deploy/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/backend/dist ./dist
```

Why: without this, the process inside the container runs as `root`. If an RCE (remote code execution) is ever found in the app, the attacker immediately gets root inside the container — which widens the blast radius further (container escape, mounted volumes, etc. become easier to exploit). `USER node` reduces this risk at no cost — the image loses no functionality from it.

`--chown=node:node` in `COPY` is required: `WORKDIR /app` is created while still `root`, **before** `USER node`, and if you copy files without `--chown`, the process running as `node` won't be able to read/execute them.

For `docs` (`nginx:alpine`) no separate `USER` is needed — the image already runs its worker processes as the unprivileged `nginx` user by default.

## Extra: HEALTHCHECK

All three `Dockerfile`s have a `HEALTHCHECK` — without it, Docker/an orchestrator (Kubernetes readiness probe, Docker Swarm, `docker-compose` with `depends_on: condition: service_healthy`) can't tell "the process is running" apart from "the app is actually responding to requests".

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1
```

| Service  | Path checked                          |
| -------- | ------------------------------------- |
| backend  | `http://127.0.0.1:${PORT}/health`     |
| frontend | `http://127.0.0.1:${PORT}/api/health` |
| docs     | `http://127.0.0.1:${PORT}/`           |

`${PORT}` in `HEALTHCHECK CMD` isn't a build-time substitution — it's a plain shell variable, read from the actual `PORT` value inside the container at check time (the same value set via `environment:` in `docker-compose.yml`).

`wget` was chosen because it's already present in the base images (`node:*-alpine`, `nginx:alpine`) out of the box — no need to install `curl` separately.

::: tip
An explicit `127.0.0.1` instead of `localhost` isn't a stylistic detail. `/etc/hosts` inside the container resolves `localhost` to both addresses, `127.0.0.1` and `::1`, and `wget` may try `::1` first. If the service only listens on IPv4 (the usual default for nginx/Node), that attempt gets `Connection refused`, and the healthcheck turns `unhealthy` even though the service is actually alive and responding on IPv4. Verified live while writing this section — with `localhost` the `docs` container went `unhealthy`, with `127.0.0.1` it was consistently `healthy`.
:::

Check the status of a running container:

```bash
docker inspect --format='{{json .State.Health}}' backend-preview
```

## Docker: build stages

All three services (`backend`, `frontend`, `docs`) build in two stages:

- [ builder ]
  - COPY package.json manifests
  - pnpm install --frozen-lockfile
  - COPY sources
  - Build the project.

- [ runner ]
  - Final image.
  - Only what's needed to run.

Backend additionally runs `pnpm deploy --prod /deploy`
— copies from node_modules only the dependencies of @repo/backend,
without the extra monorepo packages. The runner gets a clean, flat node_modules.

Frontend doesn't do this — Nuxt packages all dependencies itself
into `.output` at build time. node_modules isn't needed in the runner at all.

Docs builds VitePress into static files (`.vitepress/dist`),
the runner is just nginx, serving that static output. Neither node_modules
nor pnpm exist in the final image at all.

Why does `install` come before `COPY` sources?
Docker caches layer by layer — if the sources changed
but package.json didn't, `install` is pulled from cache.
Order: `COPY` manifests → `pnpm install` → `COPY . .`

**Backend builder:**

1. `pnpm install --frozen-lockfile` — installs all monorepo dependencies; `--frozen-lockfile` guarantees the exact same versions as in local development
2. `pnpm build @repo/shared` — compiles shared into ESM (dist/); needed before nest build, since backend imports from dist/
3. `nest build` — compiles backend into dist/
4. `pnpm deploy --prod /deploy` — copies only the needed dependencies into /deploy; doesn't re-download — takes them from node_modules

**Backend runner:**

```
/app/
├── node_modules/     ← only @repo/backend's dependencies (pnpm deploy)
│                       flat structure, no extra monorepo packages
└── dist/
    └── main.js       ← compiled code (rootDir: ./src → clean path)

CMD: node dist/main
```

**Frontend runner:**

```
/app/
└── .output/                      ← Nuxt packages everything here at build time
    ├── server/
    │   └── index.mjs             ← entry point (Node.js server)
    └── public/                   ← static files (JS, CSS, assets)

CMD: node .output/server/index.mjs

node_modules isn't needed — all dependencies are already inside .output.
.output can be copied to a server and run without pnpm.
```
