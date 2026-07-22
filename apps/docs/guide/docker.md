# Docker

В проекте три независимых `Dockerfile` (`backend`, `frontend`, `docs`) и один `docker-compose.yml`, который собирает все три в единый стек.

Каждый `Dockerfile` — multi-stage: этап `builder` ставит зависимости и собирает production-артефакт, этап `runner` — лёгкий финальный образ без исходников и dev-зависимостей.

## apps/backend

Собирает NestJS в `dist/`, разворачивает через `pnpm deploy --prod` — итоговый образ содержит только продовые `node_modules` и собранный код, без `pnpm`/исходников.

Все последующие команды выполнять **из кореня монорепозитория** (не нужно переходить в /apps/backend).

Собрать образ

```bash
docker build -f apps/backend/Dockerfile -t backend-preview .
```

Запустить контейнер на порту 3100

```bash
docker run -d -p 3100:3100 \
  -e PORT=3100 \
  -e CORS_ORIGIN_SCHEME_HOST=http://localhost \
  -e CORS_ORIGIN_PORT=3200 \
  --name backend-preview backend-preview
```

Проверить:

```bash
curl http://localhost:3100/health
```

Остановить и убрать:

```bash
docker stop backend-preview
docker rm backend-preview
docker rmi backend-preview
```

## apps/frontend

Собирает Nuxt в `.output/` (Nitro standalone-сервер — уже включает всё нужное для запуска, отдельный `node_modules` не копируется).

Все последующие команды выполнять **из кореня монорепозитория** (не нужно переходить в /apps/frontend).

Собрать образ

```bash
docker build -f apps/frontend/Dockerfile -t frontend-preview .
```

Запустить контейнер на порту 3200

```bash
docker run -d -p 3200:3200 \
  -e PORT=3200 \
  -e NUXT_PUBLIC_API_BASE=/api/backend \
  -e NUXT_PUBLIC_BACKEND_PORT=3100 \
  -e BACKEND_URL=http://localhost:3100 \
  --name frontend-preview frontend-preview
```

Проверить:

```bash
curl http://localhost:3200/api/health
```

Или откройте: [http://localhost:3200](http://localhost:3200)

::: warning
Запущенный так, отдельно от `backend`, frontend не сможет проксировать запросы к API — если backend-контейнер не поднят и не достижим по `BACKEND_URL`. Для полноценной проверки связки поднимайте через [docker compose](#docker-compose) или оба контейнера в одной Docker-сети.
:::

Остановить и убрать:

```bash
docker stop frontend-preview
docker rm frontend-preview
docker rmi frontend-preview
```

## apps/docs

Статика VitePress, отдаётся через `nginx`.

Порт внутри контейнера задаётся переменной **`PORT`** (по умолчанию `5173`, см. `apps/docs/.env.example`) — тем же способом, что и у `backend`/`frontend`, но механика внутри отличается: `nginx` сам по себе не читает переменные окружения. `apps/docs/nginx.conf.template` — не готовый конфиг, а шаблон с `listen ${PORT};`; встроенный entrypoint-скрипт образа `nginx:alpine` сам находит `*.template` в `/etc/nginx/templates/`, прогоняет через `envsubst` и кладёт результат в `/etc/nginx/conf.d/` — до старта самого `nginx`.

Все последующие команды выполнять **из кореня монорепозитория** (не нужно переходить в /apps/docs).

Собрать образ

```bash
docker build -f apps/docs/Dockerfile -t docs-preview .
```

Запустить контейнер на порту 5173

```bash
docker run -d -p 5173:5173 -e PORT=5173 --name docs-preview docs-preview
```

Проверить: [http://localhost:5173](http://localhost:5173)

Остановить и убрать:

```bash
docker stop docs-preview
docker rm docs-preview
docker rmi docs-preview
```

## docker compose

`docker-compose.yml` поднимает `backend`, `frontend` и `docs` вместе, в общей сети.

### `env_file` и override

`backend`, `frontend` и `docs` подключают свой `apps/*/.env` через `env_file:` — этот же файл используется и для `pnpm dev`.

```yaml
backend:
  env_file: apps/backend/.env
```

Файлы `.env` обязательны — без них `docker compose up` откажется стартовать (`env file ... not found`).

Иногда значение должно **отличаться** для Docker — например, `BACKEND_URL`: в `apps/frontend/.env` он `http://localhost:3100` (верно для `pnpm dev`, где всё на хосте), но внутри Docker-сети `localhost` для frontend-контейнера — это сам контейнер, а не backend. Для таких случаев `environment:` в `docker-compose.yml` **явно переопределяет** значение из файла — `environment:` всегда важнее `env_file:`:

```yaml
frontend:
  env_file: apps/frontend/.env
  environment:
    BACKEND_URL: http://backend:3100   # переопределяет localhost:3100 из .env
```

Подробнее про то, какие переменные совпадают, а какие переопределяются — см. [ENV-переменные](/guide/env-variables).

### Хост-порты, внутренний порт и почему их два

Тут два независимых порта на каждый сервис, и путать их — частая причина «контейнер поднялся, но не отвечает»:

| Что                          | Переменная                                  | Где живёт      | Кто читает |
| ----------------------------- | -------------------------------------------- | -------------- | ---------- |
| Хост-порт (снаружи Docker)    | `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT` | `.env` (корень) | только `docker-compose.yml`, в левой части `ports:` |
| Внутренний порт (что слушает процесс) | `BACKEND_INTERNAL_PORT`, `FRONTEND_INTERNAL_PORT`, `DOCS_INTERNAL_PORT` | `.env` (корень) | `docker-compose.yml` — сразу в двух местах: правая часть `ports:` **и** `environment: PORT` |

Почему внутренний порт не читается прямо из `apps/backend/.env` (там же лежит `PORT`) — а из отдельной переменной в корневом `.env`: `ports:` резолвится Compose'ом **при чтении YAML**, до старта контейнера, а `env_file:` передаёт содержимое файла только **внутрь** контейнера при старте. Это два разных момента времени — Compose физически не может подставить в `ports:` то, что лежит в `apps/backend/.env`. Единственный способ, чтобы обе половины (`ports:` и переданный внутрь `PORT`) совпадали гарантированно — взять их из одного источника, видимого Compose'у на этапе интерполяции. Отсюда — `environment: PORT` в `docker-compose.yml` явно переопределяет `PORT`, который иначе пришёл бы из `apps/*/.env` через `env_file:`.

```yaml
backend:
  ports:
    - '${BACKEND_HOST_PORT}:${BACKEND_INTERNAL_PORT}'
  env_file: apps/backend/.env
  environment:
    PORT: '${BACKEND_INTERNAL_PORT}'   # переопределяет PORT из .env
```

Если поменять только `PORT` в `apps/backend/.env`, не трогая `BACKEND_INTERNAL_PORT` в корневом `.env` — ничего не сломается: `environment:` всё равно победит и подставит значение из `BACKEND_INTERNAL_PORT`, а не то, что в файле. Чтобы реально изменить порт, на котором слушает контейнер, нужно менять `BACKEND_INTERNAL_PORT`/`FRONTEND_INTERNAL_PORT`/`DOCS_INTERNAL_PORT` в корневом `.env` — именно они одновременно и попадают в `PORT` внутри контейнера, и определяют, куда Docker проксирует хост-порт.

Для `docs` это работает так же, но `nginx` сам по себе не читает `PORT` — см. [envsubst и nginx.conf.template](#apps-docs) выше.

### Все .env-файлы обязательны

Без корневого `.env` `docker compose up` откажется стартовать — без переменных портов Compose не может резолвить `ports:` (`no port specified`). Без `apps/backend/.env`/`apps/frontend/.env`/`apps/docs/.env` — тоже откажется, с ошибкой `env file ... not found` (`env_file:`). Ни то, ни другое не подставляется тихо — это осознанный выбор, а не забытые дефолты.

Создать все недостающие `.env` одной командой, не трогая порты и не запуская сам Docker:

```bash
pnpm env:copy
```

### Запуск через `pnpm docker:up`

```bash
pnpm docker:up
```

Не просто алиас для `docker compose up` — сначала автоматически срабатывает `scripts/predocker.mjs` (через npm `pre*`-конвенцию, симметрично [`predev.mjs`](/guide/scripts#predev-mjs-predocker-mjs) для `pnpm dev`):

1. Копирует из `.env.example` все `.env`, которые отсутствуют — корневой, `apps/backend`, `apps/frontend`, `apps/docs` (та же `copyEnvFiles()`, что и в `pnpm env:copy`)
2. Проверяет `BACKEND_HOST_PORT`/`FRONTEND_HOST_PORT`/`DOCS_HOST_PORT` на занятость на хосте — при конфликте предлагает диалог: убить занявший процесс или прервать запуск

Прямой `docker compose up` (мимо `pnpm docker:up`) без нужных `.env` упадёт с ошибкой — эта команда не создаёт `.env` и не проверяет занятость портов сама. Если `.env`-файлы уже созданы (например, через `pnpm env:copy`), но с тех пор порт мог занять кто-то другой — `docker compose up` об этом не предупредит, просто откажется стартовать конкретный сервис с обычной Docker-ошибкой `address already in use`.

Хост-порты (`3500`/`3600`/`3700`) в `.env.example` намеренно не `3000`/`3001` — это самые частые дефолты у многих Node-фреймворков (Next.js, Create React App, сам Nuxt в dev-режиме), конфликт с уже запущенным на них проектом иначе почти гарантирован. Если хост-порт всё равно занят чем-то другим (не тем, что предложит убить `predocker.mjs`) — правьте только `.env`, не `docker-compose.yml`, например:

```bash
# в .env:
BACKEND_HOST_PORT=4500
```

::: tip
`NUXT_PUBLIC_BACKEND_PORT` (используется только для ссылки на backend в DevPanel, не для запросов) переопределяется в `docker-compose.yml` значением `${BACKEND_HOST_PORT}` — при смене хост-порта backend'а эту переменную вручную обновлять не нужно, она уже привязана к тому же источнику.
:::

### Сеть — важная предварительная зависимость

Сеть `template-nest-nuxt_app` объявлена как `external: true` — `docker compose` **не создаёт** её сам, ожидает, что она уже существует. Если сети нет:

```bash
docker network create template-nest-nuxt_app
```

Без этого шага `docker compose up` упадёт с ошибкой `network ... declared as external, but could not be found`.

### Запуск

Все последующие команды выполнять **из кореня монорепозитория**.

```bash
docker compose up --build
```

- Backend: `http://localhost:3500` (или `BACKEND_HOST_PORT`)
- Frontend: `http://localhost:3600` (или `FRONTEND_HOST_PORT`)
- Docs: `http://localhost:3700` (или `DOCS_HOST_PORT`)

### Остановка

```bash
docker compose down
```

Сеть `template-nest-nuxt_app` при этом не удаляется (она `external`, `compose` её не создавал — не ему и убирать). Удалить вручную, если она больше не нужна:

```bash
docker network rm template-nest-nuxt_app
```

## Дополнительно: непривилегированный пользователь

`backend` и `frontend` runner-этапы запускаются от `USER node` — встроенного непривилегированного пользователя, который уже есть в образе `node:*-alpine`, отдельно создавать не нужно:

```dockerfile
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder --chown=node:node /deploy/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/backend/dist ./dist
```

Зачем: без этого процесс внутри контейнера работает от `root`. Если в приложении найдут RCE (remote code execution), атакующий сразу получит root в контейнере — что расширяет дальнейший blast radius (проще эксплуатировать container escape, монтированные volume и т.д.). `USER node` снижает этот риск без какой-либо цены — сам образ ничего не теряет в функциональности.

`--chown=node:node` в `COPY` обязателен: `WORKDIR /app` создаётся ещё под `root` **до** `USER node`, и если просто скопировать файлы без `--chown`, процесс от `node` не сможет их прочитать/выполнить.

Для `docs` (`nginx:alpine`) отдельный `USER` не нужен — образ уже запускает worker-процессы от непривилегированного пользователя `nginx` по умолчанию.

## Дополнительно: HEALTHCHECK

Во все три `Dockerfile` добавлен `HEALTHCHECK` — без него Docker/orchestrator (Kubernetes readiness probe, Docker Swarm, `docker-compose` с `depends_on: condition: service_healthy`) не может отличить «процесс запущен» от «приложение реально отвечает на запросы».

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1
```

| Сервис   | Проверяемый путь        |
| -------- | ------------------------ |
| backend  | `http://127.0.0.1:${PORT}/health` |
| frontend | `http://127.0.0.1:${PORT}/api/health` |
| docs     | `http://127.0.0.1:${PORT}/` |

`${PORT}` в `HEALTHCHECK CMD` — не build-time подстановка, а обычная shell-переменная, читается из фактического значения `PORT` внутри контейнера в момент проверки (то же значение, что задано через `environment:` в `docker-compose.yml`).

`wget` выбран потому, что уже есть в базовых образах (`node:*-alpine`, `nginx:alpine`) из коробки — не нужно ставить `curl` отдельно.

::: tip
Явный `127.0.0.1` вместо `localhost` — не стилистическая мелочь. `/etc/hosts` внутри контейнера резолвит `localhost` в оба адреса, `127.0.0.1` и `::1`, и `wget` может попытаться сначала пойти в `::1`. Если сервис слушает только на IPv4 (обычное поведение по умолчанию для nginx/Node), такая попытка получает `Connection refused`, и healthcheck становится `unhealthy`, хотя сервис на самом деле жив и отвечает по IPv4. Проверено вживую при подготовке этого раздела — с `localhost` контейнер `docs` уходил в `unhealthy`, с `127.0.0.1` — стабильно `healthy`.
:::

Проверить статус запущенного контейнера:

```bash
docker inspect --format='{{json .State.Health}}' backend-preview
```

## Docker: стадии сборки

Все три сервиса (`backend`, `frontend`, `docs`) собираются в две стадии:

- [ builder ]
  - COPY package.json манифесты
  - pnpm install --frozen-lockfile
  - COPY исходники
  - Собираем проект.

- [ runner ]
  - Финальный образ.
  - Только то, что нужно для запуска.

Backend дополнительно запускает pnpm deploy `--prod /deploy`
— копирует из node_modules только зависимости @repo/backend,
без лишних пакетов монорепо. Runner получает чистый плоский node_modules.

Frontend этого не делает — Nuxt сам упаковывает все зависимости
в `.output` при сборке. node_modules в runner не нужен вообще.

Docs собирает VitePress в статику (`.vitepress/dist`),
runner — просто nginx, отдающий эту статику. Ни node_modules,
ни pnpm в финальном образе нет вообще.

Почему `install` идёт до `COPY` исходников?
Docker кэширует послойно — если исходники изменились,
но package.json нет, `install` берётся из кэша.
Порядок: `COPY` манифесты → `pnpm install` → `COPY . .`

**Backend builder:**

1. `pnpm install --frozen-lockfile` — устанавливает все зависимости монорепо `--frozen-lockfile` гарантирует точные версии как в локальной разработке
2. `pnpm build @repo/shared` — компилирует shared в ESM (dist/) нужно до nest build, т.к. backend импортирует из dist/
3. `nest build` — компилирует backend в dist/
4. `pnpm deploy --prod /deploy` — копирует только нужные зависимости в /deploy не скачивает заново — берёт из node_modules

**Backend runner:**

```
/app/
├── node_modules/     ← только зависимости @repo/backend (pnpm deploy)
│                       плоская структура, без лишних пакетов монорепо
└── dist/
    └── main.js       ← скомпилированный код (rootDir: ./src → чистый путь)

CMD: node dist/main
```

**Frontend runner:**

```
/app/
└── .output/                      ← Nuxt упаковывает всё сюда при сборке
    ├── server/
    │   └── index.mjs             ← точка входа (Node.js server)
    └── public/                   ← статика (JS, CSS, assets)

CMD: node .output/server/index.mjs

node_modules не нужен — все зависимости уже внутри .output.
.output можно скопировать на сервер и запустить без pnpm.
```
