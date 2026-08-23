# copy-env.mjs

The shared module with paths to all `.env`/`.env.example` files (`ROOT_ENV`, `BACKEND_ENV`, `FRONTEND_ENV`, `DOCS_ENV` and their `_EXAMPLE` variants) and the `copyEnvFiles()` function, which copies all four files at once if they're missing. It's imported both by [`predev.mjs`](/en/guide/structure/scripts/predev)/[`predocker.mjs`](/en/guide/structure/scripts/predocker) and by [`copy-env-cli.mjs`](/en/guide/structure/scripts/copy-env-cli).

`parseEnv(filePath)` lives here too — it parses a `.env` into a `{ KEY: 'value' }` object, skipping comments and blank lines.

## Usage

```js
import { copyEnvFiles, parseEnv, ROOT_ENV } from './copy-env.mjs'

// create only the missing .env files — existing ones are left alone
copyEnvFiles()

// overwrite every .env with the values from .env.example
copyEnvFiles(true)

// read a variable
const port = parseEnv(ROOT_ENV).NGINX_HOST_PORT
```

From the command line — through the npm scripts:

```bash
pnpm env:copy          # create the missing ones
pnpm env:copy:force    # overwrite all of them
```

::: warning
`--force` overwrites files **entirely** rather than adding the missing lines. Everything you changed by hand — your own ports, secrets, local settings — will be lost.
:::

Without the flag nothing is overwritten: `copyEnvExample()` checks `existsSync(envPath)` and skips the file if it's already there.
