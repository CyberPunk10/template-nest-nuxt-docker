# Скрипты

## `package.json`

В монорепо четыре `package.json` — корневой и по одному на каждый `apps/*`. Скрипты в них не пересекаются: корневые оркеструют весь монорепо целиком (`pnpm -r ...`, Docker, `.env`), а per-app — работают только внутри своего workspace и обычно вызываются через фильтр (`pnpm --filter backend dev`) или транзитивно из корневых.

### Корневой

| Скрипт | Команда | Что делает |
| --- | --- | --- |
| `env:copy` | `node scripts/copy-env-cli.mjs` | Создаёт все `.env` из `.env.example`, которых ещё нет — ничего не запускает и не проверяет |
| `predev` | `node scripts/predev.mjs` | Запускается автоматически перед `dev` (npm `pre*`-конвенция) |
| `dev` | `node scripts/dev.mjs` | Параллельно поднимает backend, frontend и docs (через `concurrently`) |
| `predocker:up` | `node scripts/predocker.mjs` | Запускается автоматически перед `docker:up` |
| `docker:up` | `docker compose up` | Поднимает все три сервиса в Docker |
| `build` | `pnpm -r build` | Собирает все workspace-пакеты (запускает `build` в каждом `apps/*`) |
| `lint` | `pnpm -r lint` | Линтер по всем workspace-пакетам |
| `type-check` | `pnpm -r type-check` | Проверка типов по всем workspace-пакетам |
| `reinstall` | `node scripts/reinstall.mjs` | Удаляет `node_modules`/`pnpm-lock.yaml` и переустанавливает зависимости с нуля |
| `prepare` | `husky` | Настраивает git-хуки (вызывается автоматически при `pnpm install`) |

### `apps/backend`

| Скрипт | Команда | Что делает |
| --- | --- | --- |
| `dev` | `nest start --watch` | Локальная разработка с hot-reload |
| `build` | `nest build` | Production-сборка в `dist/` |
| `start` | `nest start` | Запуск собранного `dist/` без watch |
| `start:prod` | `node dist/main` | Запуск в production-режиме (то, что использует `Dockerfile`) |
| `lint` | `eslint ... --fix` | Линтер с автофиксом |
| `type-check` | `tsc --noEmit` | Проверка типов без сборки |
| `test` / `test:watch` / `test:cov` / `test:e2e` | `jest ...` | Юнит- и e2e-тесты |

### `apps/frontend`

| Скрипт | Команда | Что делает |
| --- | --- | --- |
| `dev` | `nuxt dev` | Локальная разработка с hot-reload |
| `build` | `nuxt build` | Production-сборка в `.output/` |
| `preview` | `nuxt preview` | Локальный запуск production-сборки |
| `postinstall` | `nuxt prepare` | Генерирует `.nuxt/` (типы, алиасы) — запускается автоматически после `pnpm install` |
| `lint` | `eslint . --fix` | Линтер с автофиксом |
| `type-check` | `nuxt typecheck` | Проверка типов через `vue-tsc` |

### `apps/docs`

| Скрипт | Команда | Что делает |
| --- | --- | --- |
| `dev` | `vitepress dev` | Локальный dev-сервер документации |
| `build` | `vitepress build` | Статическая сборка в `.vitepress/dist/` |
| `preview` | `vitepress preview` | Локальный запуск собранной документации |

## Node-скрипты в `scripts/`

Корневые npm-скрипты выше по большей части — это тонкие обёртки над файлами из `scripts/`. Ниже — что каждый из них реально делает.

### `predev.mjs`, `predocker.mjs`

Оба скрипта запускаются автоматически (`predev.mjs` — перед `pnpm dev`, `predocker.mjs` — перед `pnpm docker:up`, через npm `pre*`-конвенцию) и делают одно и то же в две команды:

1. **Копируют `.env.example` → `.env`** для всех четырёх файлов разом (корневой, `apps/backend`, `apps/frontend`, `apps/docs`) — через общую `copyEnvFiles()` из `copy-env.mjs`. Не только «свои»: даже `predev.mjs`, запускающийся перед локальной разработкой, создаёт заодно и корневой `.env`, если его нет.
2. **Проверяют порты и разрешают конфликты** — через общую `checkPorts()` из `check-ports.mjs`. При конфликте предлагают диалог: убить занявший процесс или прервать запуск.

Разница только в том, *какие* порты они проверяют:

- `predev.mjs` — dev-порты (`PORT` из `apps/backend/.env`, `apps/frontend/.env`, `apps/docs/.env`)
- `predocker.mjs` — хост-порты (`BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT` из корневого `.env`)

::: warning
Это срабатывает только перед `pnpm docker:up`, не перед прямым `docker compose up`. Если вызвать `docker compose up` напрямую, минуя npm-обёртку, на свежем клоне без `.env` — команда откажется стартовать: у переменных портов в `docker-compose.yml` нет дефолтов (`no port specified` без корневого `.env`), а `env_file` для `apps/*/.env` обязателен по умолчанию (`env file ... not found`). Никакой явной проверки занятости портов тоже не будет — если хост-порт занят, будет обычная Docker-ошибка `address already in use`, без диалога с предложением освободить порт. Создать недостающие `.env` заранее, не запуская ничего: `pnpm env:copy`.
:::

### `copy-env.mjs`, `copy-env-cli.mjs`

`copy-env.mjs` — общий модуль с путями ко всем `.env`/`.env.example` (`ROOT_ENV`, `BACKEND_ENV`, `FRONTEND_ENV`, `DOCS_ENV` и их `_EXAMPLE`-варианты) и функцией `copyEnvFiles()`, которая копирует все четыре файла разом, если они отсутствуют. Импортируется и из `predev.mjs`/`predocker.mjs`, и из `copy-env-cli.mjs`.

`copy-env-cli.mjs` — тонкий CLI-раннер: один вызов `copyEnvFiles()`, ничего больше. Существует отдельно от `copy-env.mjs`, чтобы сам модуль оставался чистым (без побочных эффектов при импорте) — весь сайд-эффект сосредоточен в этом файле, который вызывается только из npm-скрипта `env:copy`.

### `check-ports.mjs`

Общий модуль с утилитами для работы с портами:

- `isPortFree(port)` — проверяет, свободен ли порт на `127.0.0.1`
- `killPort(port)` — завершает процесс, занявший порт (через `lsof`/`kill`, только macOS/Linux)
- `requirePort(envPath, key)` — читает обязательную переменную порта из `.env`, при отсутствии или некорректном значении бросает понятную ошибку с указанием файла
- `checkPorts(services)` — проверяет список сервисов (`{ name, envPath, key }`), при конфликте показывает диалог с предложением убить занявшие процессы или прервать запуск

`predev.mjs` и `predocker.mjs` используют одну и ту же `checkPorts()`, передавая ей разный список сервисов — вся логика диалога и завершения процессов не дублируется между скриптами.

### `dev.mjs`

Обёртка над [`concurrently`](https://www.npmjs.com/package/concurrently) — запускает три dev-команды (`pnpm --filter backend dev`, `pnpm --filter frontend dev`, `pnpm --filter docs dev`) как один процесс с общим выводом:

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

Зачем нужен именно `concurrently`, а не три параллельных `&` в shell-скрипте:

- **Именованные и цветные префиксы** — каждая строка вывода помечена `[Nest]`/`[Nuxt]`/`[Docs]` в своём цвете (`prefixColors`), а не смешанным потоком без источника — иначе не понять, какой процесс залогировал что.
- **Единый Ctrl+C** — `concurrently` перехватывает сигнал и корректно останавливает все три дочерних процесса разом. Голый `&` в shell этого не делает: `Ctrl+C` убивает только процесс на переднем плане, а backend/frontend/docs остаются висеть в фоне и держать порты.
- **Кроссплатформенность** — работает одинаково в bash/zsh и в Windows-шеллах, не полагаясь на `&`/`wait`, которые ведут себя по-разному в разных shell.

Если один из трёх процессов падает — по умолчанию `concurrently` не останавливает остальные (это поведение можно изменить через `killOthersOn`, но здесь оно не задано: разработка backend не должна прерываться, если у docs, например, временная ошибка сборки).

### `reinstall.mjs`

Удаляет `node_modules` и `pnpm-lock.yaml` (если они есть), затем запускает `pnpm install` с нуля.

::: warning Это не способ обновления зависимостей
Удаление `pnpm-lock.yaml` стирает зафиксированные версии всех транзитивных зависимостей — `pnpm install` резолвит их заново в рамках допустимых по `package.json` диапазонов (`^`/`~`), а значит может незаметно подтянуть новые минорные/патч-версии транзитивных пакетов, включая breaking-изменения в них. На раннем этапе шаблона, пока зависимостей немного, это дешёвый способ починить локально разъехавшееся состояние (например, после переключения между ветками с разными lockfile). Но как только проект дорастёт до production с устоявшимся деревом зависимостей — так обновлять пакеты не стоит: любое обновление версий должно быть осознанным и видимым в diff'е `pnpm-lock.yaml`, а не результатом полного пересчёта с нуля.

Идиоматичный способ обновить зависимости — `pnpm update` (обновляет в рамках диапазонов из `package.json`, лишь дополняя существующий lockfile, не удаляя его) или `pnpm update --interactive` (показывает список доступных обновлений и даёт выбрать, какие принять). Для точечного апдейта одного пакета — `pnpm update <пакет>`.
:::

Полезно, когда локальное состояние зависимостей разъехалось (например, после смены веток с разными lockfile) и нужен чистый старт — но не как повседневный инструмент.
