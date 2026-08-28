# predev.mjs

Runs automatically before `pnpm dev` — via the npm `pre*` convention.

It does three things:

1. **Copies `.env.example` → `.env`** for all four files at once (root, `apps/backend`, `apps/frontend`, `apps/docs`) — via the shared `copyEnvFiles()` from [`copy-env.mjs`](/en/guide/structure/scripts/copy-env). Not just "its own": even running before local development, it also creates the root `.env` if it's missing.
2. **Checks ports and resolves conflicts** — via the shared `checkPorts()` from [`check-ports.mjs`](/en/guide/structure/scripts/check-ports). On conflict it offers a dialog: kill the process holding the port or abort the run.
3. **Brings the database up** — via `dbUp()` from [`db.mjs`](/en/guide/structure/scripts/db). Under `pnpm dev` the applications run locally, but Postgres is needed from Docker. Calling it again on an already running container changes nothing.

The ports checked are the dev ones: `PORT` from `apps/backend/.env`, `apps/frontend/.env` and `apps/docs/.env`.

The database port isn't on that list: the check can only kill processes on the host, and this port is held by Docker. Step 3 catches it instead — Docker says `address already in use`.

[`predocker.mjs`](/en/guide/structure/scripts/predocker) does the same — differing in the list of ports and in not starting the database separately: `docker compose` brings it up along with the other services.

## Usage

It runs on its own — no need to call it separately:

```bash
pnpm dev
```

npm sees the `predev` script and runs it before `dev`. To run only the preparation, without starting the applications:

```bash
pnpm predev
```
