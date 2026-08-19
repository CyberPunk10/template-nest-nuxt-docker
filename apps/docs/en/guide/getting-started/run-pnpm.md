# Running with pnpm

The main development mode: applications run natively, each with its own hot reload. Docker isn't needed.

Before the first run — [Setup](/en/guide/getting-started/setup).

## pnpm dev

```bash
pnpm dev
```

One command brings up all three applications. Before it starts, `predev.mjs` runs: it creates missing `.env` files and resolves port conflicts.

| Service  | URL                               | Technology       |
| -------- | --------------------------------- | ---------------- |
| Backend  | `http://localhost:3100`           | NestJS `--watch` |
| Frontend | `http://localhost:3200`           | Nuxt dev         |
| Docs     | `http://localhost:5173/dev/docs/` | VitePress dev    |

Each application listens on its own port: the reverse proxy takes no part in this mode — [why](/en/guide/reverse-proxy#no-proxy-in-dev-mode).

API requests go through the Nuxt BFF proxy (`/api/backend/*`), same as under Docker — that path is identical in both modes.

## A single application

`pnpm dev` starts everything at once, but you can run just one when needed:

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
pnpm --filter @repo/docs dev
```

## pnpm build

Check the production build without containers:

```bash
pnpm build

# start the backend
cd apps/backend && pnpm start:prod

# start the frontend (in another terminal)
cd apps/frontend && node .output/server/index.mjs
```

This is closer to production than `pnpm dev`, but still not the same: there's no reverse proxy, and the applications are reachable directly on their own ports. For a full rehearsal — [running with Docker](/en/guide/getting-started/run-docker).

## Stopping

`Ctrl+C` in the terminal running `pnpm dev` — `concurrently` stops all three processes at once.

::: warning
If the process was killed some other way (the terminal was closed, say), child processes may survive and keep holding ports. `predev.mjs` detects that on the next run and offers to terminate them.
:::
