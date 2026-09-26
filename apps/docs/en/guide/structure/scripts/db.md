# db.mjs

Manages the database container. Works both as a CLI (`pnpm db:up` / `pnpm db:down`) and as a module — `dbUp()` is called from [`predev.mjs`](/en/guide/structure/scripts/predev).

The database lives in the shared `docker-compose.yml` with no profile, while the application services sit behind the `app` profile. That's why a command without a profile only touches `postgres` — more in [docker-compose.yml](/en/guide/structure/docker-compose#profiles).

## Commands

| Command        | What it does                                                              |
| -------------- | ------------------------------------------------------------------------- |
| `pnpm db:up`   | Creates the network if needed, starts `postgres` and waits for healthcheck |
| `pnpm db:down` | Stops `postgres`; the data stays in its volume                            |

You rarely need `db:up` on its own: `pnpm dev` brings the database up itself. It helps when the applications aren't needed — to apply migrations, say, or to connect with a client.

## Waiting for readiness

`up` passes the `--wait` flag: the command returns not when the container has been created, but when its healthcheck turns `healthy`. Without it Nest starts connecting before Postgres accepts connections and dies on startup.

```js
compose(['up', '-d', '--wait', 'postgres'])
```

The healthcheck is declared on the `postgres` service and relies on `pg_isready`.

## Why `down` only stops

`dbDown()` calls `docker compose stop`, not `down`. The consequences differ: `down` removes the container, and `down -v` removes the volume with the data too. Deleting data is deliberately not wrapped in a pnpm command, so it can't happen out of habit:

```bash
docker compose down -v   # drops the database along with its data
```

## Using it as a module

```js
import { dbUp } from './db.mjs'

dbUp()   // network + postgres + waiting for healthcheck
```
