# ENV variables

## Files

Four independent `.env` files — one per app, plus a root one for Docker:

```
template-nest-nuxt/
├── .env[.example]            ← read by docker-compose.yml
├── apps/
│   ├── backend/
│   │   └── .env[.example]    ← read directly by NestJS
│   ├── frontend/
│   │   └── .env[.example]    ← read directly by Nuxt
│   └── docs/
│       └── .env[.example]    ← VitePress dev server (dotenv)
└── ...
```

Each app reads **only its own** `.env`, unaware the others exist. The root `.env` is needed for docker-compose.

Only `.env.example` files live in the repo — actual `.env` files are created by copying: manually via `pnpm env:copy`, or automatically on the first `pnpm dev`/`pnpm docker:up` (see [`predev.mjs`, `predocker.mjs`](/en/guide/scripts#predev-mjs-predocker-mjs) in the [Scripts](/en/guide/scripts) guide). Copying is always safe — existing `.env` files are never overwritten.

## Three layers of ports

The same service can have **up to three different ports**, depending on the run context — this isn't duplication or a typo, each one has its own role:

| Layer | Variable | File | Meaning |
| --- | --- | --- | --- |
| Dev port | `PORT` | `apps/backend/.env`, `apps/frontend/.env`, `apps/docs/.env` | What the process listens on during `pnpm dev` |
| Internal port | `BACKEND_INTERNAL_PORT`, `FRONTEND_INTERNAL_PORT`, `DOCS_INTERNAL_PORT` | `.env` (root) | What the process listens on **inside the container** in Docker |
| Host port | `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT` | `.env` (root) | What the service is visible on **outside** Docker (`localhost:<host-port>` on the machine) |

Why not a single variable: `pnpm dev` and Docker are different run processes with different requirements. In Docker, the process inside the container and the address the host machine reaches it at are two numbers connected via NAT-style port mapping (`ports: "<host-port>:<internal-port>"`), while `pnpm dev` is just one process on the bare machine with one port.

### Why `PORT` isn't read from `apps/*/.env` in Docker

The container's internal port is **not** read directly from `apps/backend/.env` (which already has its own `PORT`), even though `env_file:` does pass that whole file into the container. The reason is timing: `docker-compose.yml`'s `ports:` (where Docker should proxy to) is resolved by Compose while reading the YAML, **before** the container starts, while `env_file:` only passes variables into the container **at** startup. For both halves (`ports:` and what actually ends up in `PORT` inside the container) to reliably match, both must come from a single source visible to Compose at interpolation time — the root `.env`. Hence `environment: PORT: '${BACKEND_INTERNAL_PORT}'` in `docker-compose.yml`, which explicitly overrides what would otherwise come from `apps/backend/.env` via `env_file:` (`environment:` in Compose always wins over `env_file:`).

Practical consequence: changing `PORT` in `apps/backend/.env` breaks nothing for `pnpm dev`, but changes nothing for Docker either — `environment:` still wins with the value from `BACKEND_INTERNAL_PORT`. To actually change the port for Docker, you need to change `BACKEND_INTERNAL_PORT`/`FRONTEND_INTERNAL_PORT`/`DOCS_INTERNAL_PORT` in the root `.env`.

`docs` has an extra wrinkle: inside the container `nginx` runs, and it doesn't read environment variables on its own — `PORT` reaches the config via `envsubst`, which renders `apps/docs/nginx.conf.template` (`listen ${PORT};`) into a real `nginx.conf` when the container starts.

For more detail, with a `docker-compose.yml` example — see [Docker → Host ports, internal port, and why there are two](/en/guide/docker#host-ports-internal-port-and-why-there-are-two).

## Variables by file

### `.env` (root)

| Variable | Value | Comment |
| --- | --- | --- |
| `BACKEND_HOST_PORT` | `3500` | Backend host port — what the service is visible on outside Docker |
| `FRONTEND_HOST_PORT` | `3600` | Frontend host port |
| `DOCS_HOST_PORT` | `3700` | Docs host port |
| `BACKEND_INTERNAL_PORT` | `3100` | Port backend listens on **inside the container** |
| `FRONTEND_INTERNAL_PORT` | `3200` | Port frontend listens on inside the container |
| `DOCS_INTERNAL_PORT` | `3300` | Port nginx (docs) listens on inside the container |

### `apps/backend/.env`

| Variable | Value (dev) | Comment |
| --- | --- | --- |
| `PORT` | `3100` | Backend port during `pnpm dev`. Overridden by `BACKEND_INTERNAL_PORT` from the root `.env` in Docker |
| `CORS_ORIGIN_SCHEME_HOST` | `http://localhost` | Allowed CORS origin — scheme+host. Unchanged in Docker |
| `CORS_ORIGIN_PORT` | `3200` | Allowed CORS origin — frontend's port. Overridden by `FRONTEND_HOST_PORT` in Docker |

### `apps/frontend/.env`

| Variable | Value (dev) | Comment |
| --- | --- | --- |
| `PORT` | `3200` | Frontend port during `pnpm dev`. Overridden by `FRONTEND_INTERNAL_PORT` from the root `.env` in Docker |
| `NUXT_PUBLIC_API_BASE` | `/api/backend` | Prefix for the server-side proxy to backend (the browser hits this, not backend directly) |
| `BACKEND_URL` | `http://localhost:3100` | Backend address for Nuxt SSR (server). Overridden in Docker to `http://backend:${BACKEND_INTERNAL_PORT}` — by service name, since `localhost` is unreachable inside the Docker network |
| `NUXT_PUBLIC_BACKEND_PORT` | `3100` | Backend port only, for the link shown in DevPanel (not used for requests). Overridden by `BACKEND_HOST_PORT` in Docker |

### `apps/docs/.env`

| Variable | Value | Comment |
| --- | --- | --- |
| `PORT` | `5173` | VitePress dev server port. Read via `dotenv` in `.vitepress/config.ts` — VitePress itself doesn't load `.env`. Not used in Docker |
