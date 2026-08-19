# copy-env-cli.mjs

Тонкий CLI-раннер: читает флаг `--force` из аргументов и вызывает `copyEnvFiles()`.

```js
import { copyEnvFiles } from './copy-env.mjs'

const force = process.argv.includes('--force')

copyEnvFiles(force)
```

Отсюда два npm-скрипта:

```bash
pnpm env:copy          # node scripts/copy-env-cli.mjs
pnpm env:copy:force    # node scripts/copy-env-cli.mjs --force
```

Существует отдельно от [`copy-env.mjs`](/guide/structure/scripts/copy-env), чтобы сам модуль оставался чистым (без побочных эффектов при импорте) — весь сайд-эффект сосредоточен в этом файле, который вызывается только из npm-скриптов.
