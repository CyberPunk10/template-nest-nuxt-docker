# copy-env-cli.mjs

A thin CLI runner: it reads the `--force` flag from the arguments and calls `copyEnvFiles()`.

```js
import { copyEnvFiles } from './copy-env.mjs'

const force = process.argv.includes('--force')

copyEnvFiles(force)
```

Hence the two npm scripts:

```bash
pnpm env:copy          # node scripts/copy-env-cli.mjs
pnpm env:copy:force    # node scripts/copy-env-cli.mjs --force
```

It exists separately from [`copy-env.mjs`](/en/guide/structure/scripts/copy-env) so the module itself stays clean (no side effects on import) — all the side effect is concentrated in this file, which is only invoked from the npm scripts.
