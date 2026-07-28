# Запуск проекта

Два варианта запуска — **pnpm** или **Docker**, каждый со своим dev/production:

|            | Development                                                                       | Production                                                                                       |
| ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **pnpm**   | [`pnpm dev`](#pnpm-dev) — повседневная разработка, hot-reload, самый быстрый путь | [`pnpm build`](#pnpm-build-production-сборка-без-docker) — проверить прод-сборку без контейнеров |
| **Docker** | не настроено — см. заметку в разделе [Docker](#docker-—-все-сервисы)              | [`docker compose up`](#docker-—-все-сервисы) — прод-стек в контейнерах, как в деплое             |

## Предварительная подготовка

### 1. Node.js ≥ 24

```bash
node -v
```

Версия закреплена в `.nvmrc` и `engines` корневого `package.json`. `.npmrc` содержит `engine-strict=true` — `pnpm install` **откажется** ставить зависимости на неподходящей версии Node вместо тихой установки, которая могла бы сломаться на рантайме позже.

::: details Как установить (nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
```

Затем в корне репозитория (там лежит `.nvmrc`):

```bash
nvm install 24
nvm use 24
```

Подробности — [nvm-sh/nvm](https://github.com/nvm-sh/nvm).
:::

### 2. pnpm ≥ 11 через Corepack

```bash
pnpm --version
```

Версия pnpm закреплена в `packageManager` корневого `package.json` — рекомендуемый способ её получить — [Corepack](https://nodejs.org/api/corepack.html), встроенный в Node.js.

::: details Как установить (Corepack)
```bash
corepack enable
```

Дальше `pnpm` в этом проекте будет той версией, что указана в `packageManager`. Если уже есть другой pnpm, установленный глобально — он может перехватывать вызов раньше Corepack-шима, подставляя другую версию `pnpm`. Проверьте версию `pnpm --version` и если она отличается от той, что указана в `packageManager`, то ознакомьтесь с этим разделом [pnpm и Corepack](/guide/pnpm).
:::

### 3. Docker + Docker Compose

```bash
docker --version
docker compose version
```

::: details Как установить
Полная инструкция под вашу ОС — [docs.docker.com/get-started/get-docker](https://docs.docker.com/get-started/get-docker/).

Быстрый путь для Linux:

```bash
curl -fsSL https://get.docker.com | sh
```
:::

### 4. Docker-сеть

```bash
docker network create template-nest-nuxt_app
```

Нужна только для Docker-режима, один раз. Сеть объявлена в `docker-compose.yml` как `external: true` — `docker compose` ожидает, что она уже существует, и не создаёт её сам. Без этого шага `docker compose up` упадёт с ошибкой `network ... declared as external, but could not be found`.

### 5. `.env`-файлы

Копировать `.env.example` → `.env` вручную не обязательно — при первом запуске это делает сам скрипт-обёртка (`pnpm dev` → `predev.mjs`, `pnpm docker:up` → `predocker.mjs`) — оба создают **все** `.env`, которых ещё нет: корневой, `apps/backend`, `apps/frontend`, `apps/docs`.

Если нужно создать их заранее — например, перед прямым `docker compose up`, минуя `pnpm docker:up` — есть отдельная команда, которая делает только это:

```bash
pnpm env:copy
```

Подробнее про то, какие переменные где и почему — см. [ENV-переменные](/guide/env-variables).

## pnpm dev

```bash
pnpm dev
```

Одна команда поднимает всё нужное нативно, с hot-reload у каждого сервиса. Перед стартом отрабатывает `predev.mjs` (см. шаг 5 выше): создаёт `.env`, если их нет, и разруливает конфликты портов.

| Сервис   | URL                     | Технология       |
| -------- | ----------------------- | ---------------- |
| Backend  | `http://localhost:3100` | NestJS `--watch` |
| Frontend | `http://localhost:3200` | Nuxt dev         |
| Docs     | `http://localhost:5173` | VitePress dev    |

::: tip
При переключении веток локальный `.env` не обновляется автоматически — в нём могут отсутствовать переменные новой ветки. Сверьте с `.env.example` и добавьте недостающие.
:::

## pnpm build (production-сборка без Docker)

Проверить production-сборку без контейнеров:

```bash
pnpm build

# запустить backend
cd apps/backend && pnpm start:prod

# запустить frontend (в другом терминале)
cd apps/frontend && node .output/server/index.mjs
```

## Docker — все сервисы

::: info
Только production-режим — `docker compose up` всегда собирает и запускает прод-образы (multi-stage build, без volume-mount исходников). Отдельного Docker dev-режима с hot-reload пока нет — для разработки используйте [`pnpm dev`](#pnpm-dev).
:::

```bash
pnpm docker:up --build
```

`pnpm docker:up` — не просто алиас для `docker compose up`: перед стартом отрабатывает `predocker.mjs` (см. шаг 5 выше) — создаёт корневой `.env`, если его нет, и проверяет хост-порты на занятость, предлагая убить занявший процесс при конфликте.

- Backend: `http://localhost:3500` (или `BACKEND_HOST_PORT` из `.env`)
- Frontend: `http://localhost:3600` (или значение `FRONTEND_HOST_PORT` из `.env`)
- Docs: `http://localhost:3700` (или `DOCS_HOST_PORT` из `.env`)

::: warning
Прямой `docker compose up`, минуя `pnpm docker:up`, тоже работает, но без подготовки — без корневого `.env` он откажется стартовать (`no port specified`), без `apps/*/.env` — тоже (`env file ... not found`). А при занятом хост-порте выдаст обычную Docker-ошибку `address already in use`, без диалога с предложением освободить порт.
:::

Как устроена схема портов, `env_file`/`environment` override, зачем нужен `USER node` и `HEALTHCHECK` — см. [Docker](/guide/docker).

## Остановка

Docker compose:

```bash
docker compose down
```

Сеть `template-nest-nuxt_app` при этом не удаляется — она `external`, `compose` её не создавал, не ему и убирать. Удалить вручную, если больше не нужна:

```bash
docker network rm template-nest-nuxt_app
```

## Docker — по одному сервису

Можно собрать и запустить `backend`, `frontend` или `docs` отдельным контейнером, без `docker compose` — например, для точечной проверки одного образа.

Команды для запуска каждого сервиса по отдельности смотрите в разделе [Docker](/guide/docker).
