# Scripts

## `package.json`

The monorepo has four `package.json` files — the root one and one per `apps/*`. Their scripts don't overlap: root scripts orchestrate the whole monorepo (`pnpm -r ...`, Docker, `.env`), while per-app scripts only work inside their own workspace and are usually invoked either through a filter (`pnpm --filter backend dev`) or transitively from the root scripts.

### Root

| Script | Command | What it does |
| --- | --- | --- |
| `env:copy` | `node scripts/copy-env-cli.mjs` | Creates any missing `.env` files from `.env.example` — doesn't run or check anything else |
| `predev` | `node scripts/predev.mjs` | Runs automatically before `dev` (npm `pre*` convention) |
| `dev` | `node scripts/dev.mjs` | Brings up backend, frontend, and docs in parallel (via `concurrently`) |
| `predocker:up` | `node scripts/predocker.mjs` | Runs automatically before `docker:up` |
| `docker:up` | `docker compose up` | Brings up all three services in Docker |
| `build` | `pnpm -r build` | Builds all workspace packages (runs `build` in each `apps/*`) |
| `lint` | `pnpm -r lint` | Runs the linter across all workspace packages |
| `type-check` | `pnpm -r type-check` | Type-checks all workspace packages |
| `reinstall` | `node scripts/reinstall.mjs` | Removes `node_modules`/`pnpm-lock.yaml` and reinstalls dependencies from scratch |
| `prepare` | `husky` | Sets up git hooks (runs automatically on `pnpm install`) |

### `apps/backend`

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `nest start --watch` | Local development with hot-reload |
| `build` | `nest build` | Production build into `dist/` |
| `start` | `nest start` | Runs the built `dist/` without watch mode |
| `start:prod` | `node dist/main` | Runs in production mode (what the `Dockerfile` uses) |
| `lint` | `eslint ... --fix` | Linter with auto-fix |
| `type-check` | `tsc --noEmit` | Type-checks without building |
| `test` / `test:watch` / `test:cov` / `test:e2e` | `jest ...` | Unit and e2e tests |

### `apps/frontend`

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `nuxt dev` | Local development with hot-reload |
| `build` | `nuxt build` | Production build into `.output/` |
| `preview` | `nuxt preview` | Runs the production build locally |
| `postinstall` | `nuxt prepare` | Generates `.nuxt/` (types, aliases) — runs automatically after `pnpm install` |
| `lint` | `eslint . --fix` | Linter with auto-fix |
| `type-check` | `nuxt typecheck` | Type-checks via `vue-tsc` |

### `apps/docs`

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `vitepress dev` | Local docs dev server |
| `build` | `vitepress build` | Static build into `.vitepress/dist/` |
| `preview` | `vitepress preview` | Runs the built docs locally |

## Node scripts in `scripts/`

Most of the root npm scripts above are thin wrappers around files in `scripts/`. Below is what each one actually does.

### `predev.mjs`, `predocker.mjs`

Both scripts run automatically (`predev.mjs` — before `pnpm dev`, `predocker.mjs` — before `pnpm docker:up`, via the npm `pre*` convention) and do the same two things:

1. **Copy `.env.example` → `.env`** for all four files at once (root, `apps/backend`, `apps/frontend`, `apps/docs`) — via the shared `copyEnvFiles()` from `copy-env.mjs`. Not just "their own": even `predev.mjs`, which runs before local development, also creates the root `.env` if it's missing.
2. **Check ports and resolve conflicts** — via the shared `checkPorts()` from `check-ports.mjs`. On conflict, they offer a dialog: kill the process holding the port or abort the run.

The only difference is *which* ports they check:

- `predev.mjs` — dev ports (`PORT` from `apps/backend/.env`, `apps/frontend/.env`, `apps/docs/.env`)
- `predocker.mjs` — host ports (`BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT` from the root `.env`)

::: warning
This only runs before `pnpm docker:up`, not before a direct `docker compose up`. If you call `docker compose up` directly, bypassing the npm wrapper, on a fresh clone without `.env` files — the command refuses to start: the port variables in `docker-compose.yml` have no defaults (`no port specified` without a root `.env`), and `env_file` for `apps/*/.env` is required by default (`env file ... not found`). There's also no explicit port-conflict check — if a host port is taken, you'll get a plain Docker `address already in use` error, with no dialog offering to free it up. Create the missing `.env` files ahead of time, without running anything: `pnpm env:copy`.
:::

### `copy-env.mjs`, `copy-env-cli.mjs`

`copy-env.mjs` is the shared module with paths to all `.env`/`.env.example` files (`ROOT_ENV`, `BACKEND_ENV`, `FRONTEND_ENV`, `DOCS_ENV` and their `_EXAMPLE` variants) and the `copyEnvFiles()` function, which copies all four files at once if they're missing. It's imported both by `predev.mjs`/`predocker.mjs` and by `copy-env-cli.mjs`.

`copy-env-cli.mjs` is a thin CLI runner: a single call to `copyEnvFiles()`, nothing more. It exists separately from `copy-env.mjs` so the module itself stays clean (no side effects on import) — all the side effect is concentrated in this file, which is only invoked from the `env:copy` npm script.

### `check-ports.mjs`

A shared module with port-related utilities:

- `isPortFree(port)` — checks whether a port is free on `127.0.0.1`
- `killPort(port)` — kills the process holding a port (via `lsof`/`kill`, macOS/Linux only)
- `requirePort(envPath, key)` — reads a required port variable from `.env`, throwing a clear error naming the file if it's missing or invalid
- `checkPorts(services)` — checks a list of services (`{ name, envPath, key }`), and on conflict shows a dialog offering to kill the processes holding the ports or abort the run

`predev.mjs` and `predocker.mjs` both use the same `checkPorts()`, passing it a different list of services — none of the dialog or process-killing logic is duplicated between the two scripts.

### `dev.mjs`

A wrapper around [`concurrently`](https://www.npmjs.com/package/concurrently) — runs the three dev commands (`pnpm --filter backend dev`, `pnpm --filter frontend dev`, `pnpm --filter docs dev`) as one process with combined output:

```js
concurrently(
  [
    { command: 'pnpm --filter backend dev', name: 'Nest' },
    { command: 'pnpm --filter frontend dev', name: 'Nuxt' },
    { command: 'pnpm --filter docs dev', name: 'Docs' },
  ],
  { prefixColors: ['#e0234e', '#ffca28', '#55a5d3'] },
)
```

Why `concurrently` specifically, and not three parallel `&` in a shell script:

- **Named, colored prefixes** — every output line is tagged `[Nest]`/`[Nuxt]`/`[Docs]` in its own color (`prefixColors`), instead of a mixed stream with no indication of source — otherwise there's no way to tell which process logged what.
- **A single Ctrl+C** — `concurrently` intercepts the signal and cleanly stops all three child processes at once. A bare `&` in a shell doesn't do this: `Ctrl+C` only kills the foreground process, while backend/frontend/docs keep running in the background, holding their ports.
- **Cross-platform** — works the same in bash/zsh and in Windows shells, without relying on `&`/`wait`, which behave differently across shells.

If one of the three processes crashes, `concurrently` doesn't stop the others by default (this can be changed via `killOthersOn`, but it isn't set here: backend development shouldn't be interrupted just because docs, say, has a temporary build error).

### `reinstall.mjs`

Removes `node_modules` and `pnpm-lock.yaml` (if present), then runs `pnpm install` from scratch.

::: warning Not a way to update dependencies
Deleting `pnpm-lock.yaml` wipes the pinned versions of all transitive dependencies — `pnpm install` resolves them again within the ranges allowed by `package.json` (`^`/`~`), which means it can silently pull in newer minor/patch versions of transitive packages, including breaking changes in them. Early in a template's life, while there aren't many dependencies yet, this is a cheap way to fix a locally drifted state (e.g. after switching between branches with different lockfiles). But once the project grows into production with a settled dependency tree, updating this way is no longer appropriate — any version bump should be deliberate and visible in the `pnpm-lock.yaml` diff, not the result of a full recompute from scratch.

The idiomatic way to update dependencies is `pnpm update` (updates within the ranges from `package.json`, only extending the existing lockfile, not deleting it) or `pnpm update --interactive` (shows a list of available updates and lets you pick which to accept). For updating a single package — `pnpm update <package>`.
:::

Useful when the local dependency state has drifted (e.g. after switching branches with different lockfiles) and you need a clean start — but not as an everyday tool.
