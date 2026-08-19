# copy-env.mjs

Общий модуль с путями ко всем `.env`/`.env.example` и функцией `copyEnvFiles()`, которая копирует все четыре файла разом, если они отсутствуют.

Здесь же лежит `parseEnv(filePath)` — разбирает `.env` в объект `{ KEY: 'value' }`, пропуская комментарии и пустые строки.

## Использование

```js
import { copyEnvFiles, parseEnv, ROOT_ENV } from './copy-env.mjs'

// создать только недостающие .env — существующие не тронуты
copyEnvFiles()

// перезаписать все .env файлы из .env.example
copyEnvFiles(true)

// прочитать переменную
const port = parseEnv(ROOT_ENV).NGINX_HOST_PORT
```

Из командной строки — через npm-скрипты:

```bash
pnpm env:copy          # создать недостающие
pnpm env:copy:force    # перезаписать все
```

::: warning
`--force` перезаписывает файлы **целиком**, а не дописывает недостающие строки. Всё, что вы меняли руками — свои порты, секреты, локальные настройки — будет потеряно.
:::

