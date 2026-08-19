# predev.mjs

Runs automatically before `pnpm dev` — via the npm `pre*` convention.

It does two things:

1. **Copies `.env.example` → `.env`** for all four files at once (root, `apps/backend`, `apps/frontend`, `apps/docs`) — via the shared `copyEnvFiles()` from [`copy-env.mjs`](/en/guide/structure/scripts/copy-env). Not just "its own": even running before local development, it also creates the root `.env` if it's missing.
2. **Checks ports and resolves conflicts** — via the shared `checkPorts()` from [`check-ports.mjs`](/en/guide/structure/scripts/check-ports). On conflict it offers a dialog: kill the process holding the port or abort the run.

The ports checked are the dev ones: `PORT` from `apps/backend/.env`, `apps/frontend/.env` and `apps/docs/.env`.

[`predocker.mjs`](/en/guide/structure/scripts/predocker) does the same — differing only in the list of ports and in additionally setting up the Docker network.

## Usage

It runs on its own — no need to call it separately:

```bash
pnpm dev
```

npm sees the `predev` script and runs it before `dev`. To run only the preparation, without starting the applications:

```bash
pnpm predev
```
