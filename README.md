# template-nest-nuxt-docker

Переиспользуемый шаблон монорепозитория NestJS + Nuxt 4, завёрнутый в Docker

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js&logoColor=white)

## Варианты

Шаблон существует в нескольких версиях — каждая хранится в отдельной git-ветке и является самостоятельной точкой старта. Выберите нужную и клонируйте сразу с ней.

### `main` — базовый шаблон

NestJS + Nuxt 4 + Docker. Users CRUD in-memory, i18n, Swagger, ESLint, Husky. Без БД.

```bash
git clone https://github.com/CyberPunk10/template-nest-nuxt-docker.git my-app
```

### `auth-session` — + JWT авторизация

Всё из `main`, плюс Passport.js, email+пароль, httpOnly cookies, сессии in-memory, глобальный guard, `@Public()` декоратор.

```bash
git clone -b auth-session https://github.com/CyberPunk10/template-nest-nuxt-docker.git my-app
```

### `postgres-prisma` — + PostgreSQL + Prisma

Всё из `main`, плюс Prisma 7 + PostgreSQL 17, PrismaModule, миграции, docker-compose с БД.

```bash
git clone -b postgres-prisma https://github.com/CyberPunk10/template-nest-nuxt-docker.git my-app
```

---

## Структура

```
template-nest-nuxt/
├── apps/
│   ├── backend/        ← NestJS API (порт задаётся в .env)
│   ├── frontend/       ← Nuxt 4 (порт задаётся в .env)
│   └── docs/           ← VitePress-документация (порт задаётся в .env)
├── packages/
│   ├── shared/         ← @repo/shared — общие типы и i18n переводы
│   └── ui/             ← @repo/ui — общие Vue компоненты
└── ...конфиги монорепо
```

---

## Конфигурация окружения

Каждое приложение читает **только свой** `.env`:

| Файл                 | Назначение                                  |
| -------------------- | -------------------------------------------- |
| `apps/backend/.env`  | Локальная разработка NestJS                  |
| `apps/frontend/.env` | Локальная разработка Nuxt                     |
| `apps/docs/.env`     | Локальная разработка VitePress                |
| `.env` (в корне)     | Только для Docker (хост-порты и внутренние порты контейнеров) |

Если `apps/backend/.env`/`apps/frontend/.env`/`apps/docs/.env` отсутствует, он автоматически копируется из `.env.example` при первом `pnpm dev` (`predev.mjs`). Корневой `.env` копируется тем же образом при первом `pnpm docker:up` (`predocker.mjs`).

### Изменение портов

Для `pnpm dev` (локальная разработка):

1. `apps/backend/.env` — `PORT` (порт backend), `CORS_ORIGIN_SCHEME_HOST`+`CORS_ORIGIN_PORT` (должен содержать порт frontend)
2. `apps/frontend/.env` — `PORT` (порт frontend), `BACKEND_URL` (должен содержать порт backend), `NUXT_PUBLIC_BACKEND_PORT` (только порт backend, для ссылки в DevPanel — не для запросов)
3. `apps/docs/.env` — `PORT` (порт VitePress dev-сервера, читается через `dotenv` в `.vitepress/config.ts` — сам VitePress `.env` не грузит)

Для Docker — правьте только корневой `.env`, не `docker-compose.yml`:

- `BACKEND_HOST_PORT`/`FRONTEND_HOST_PORT`/`DOCS_HOST_PORT` — хост-порты (на чём сервис доступен снаружи)
- `BACKEND_INTERNAL_PORT`/`FRONTEND_INTERNAL_PORT`/`DOCS_INTERNAL_PORT` — порт внутри контейнера

`docker-compose.yml` сам синхронизирует `CORS_ORIGIN_PORT` backend'а с хост-портом frontend'а (`FRONTEND_HOST_PORT`) — этого вручную трогать не нужно. Подробнее — см. [`apps/docs/guide/docker.md`](apps/docs/guide/docker.md) и [`apps/docs/guide/env-variables.md`](apps/docs/guide/env-variables.md).

> **Запуск из папки приложения:** `pnpm dev` из `apps/backend` или `apps/frontend` работает — каждое приложение читает свой `.env`. Предпочтительный способ — `pnpm dev` из корня монорепо.

---

## Что настроено

### Монорепо

- **pnpm workspaces** — общие зависимости
- **TypeScript strict** — строгий режим, path alias `@repo/*`
- **ESLint** — статический анализ кода (неиспользуемые переменные, потенциальные ошибки)
- **Husky + lint-staged** — перед каждым коммитом автоматически запускает ESLint на изменённых файлах

### Пакеты

- **@repo/shared** — общие TypeScript типы (DTO) и i18n переводы (ru/en/th)
- **@repo/ui** — библиотека Vue компонентов (`UiButton`, `UiBadge`, `UiCard`)
- **Proxy** — Nuxt server route проксирует `/api/backend/*` → NestJS, без CORS в dev
- **Users CRUD** — полный REST на бекенде (`GET/POST/PUT/DELETE /users`), UI на фронтенде

### Backend

- **Swagger/OpenAPI** — интерактивная документация API с возможностью тестировать запросы прямо в браузере. Доступна только в dev на `http://localhost:3100/api/docs`, в production не монтируется
- **Exception filter** — глобальный перехватчик ошибок: клиент всегда получает единообразный JSON, непредвиденные ошибки (`500`) логируются через NestJS Logger со stack trace
- **ValidationPipe** — автоматическая валидация тела запросов через DTO: лишние поля отклоняются с `400`, типы приводятся автоматически
- **Joi** — валидация переменных окружения при старте приложения: если обязательная переменная отсутствует или имеет неверный тип — сервис не запустится с понятной ошибкой

### Инфраструктура

- **Docker** — multi-stage образы для backend, frontend и docs
- **docker compose** — поднимает все три сервиса вместе, в общей сети
- **`pnpm docker:up`** — обёртка над `docker compose up`: создаёт корневой `.env` из `.env.example`, проверяет занятость хост-портов

---

## Запуск

### Локально (dev)

Основной режим разработки — hot reload, быстрый старт:

```bash
pnpm install
pnpm dev
```

`pnpm dev` автоматически запускает `scripts/predev.mjs` (через npm `pre*` соглашение), который:

- копирует `.env` из `.env.example` если файл отсутствует
- проверяет порты и предлагает разрешить конфликт если они заняты

> **При переключении веток** локальный `.env` не обновляется автоматически — в нём могут отсутствовать переменные новой ветки. Сверьте с `.env.example` и добавьте недостающие.

- Backend:  http://localhost:3100
- Frontend: http://localhost:3200
- Docs:     http://localhost:5173

### Локально (prod-сборка)

Проверить production-сборку без Docker:

```bash
pnpm build

# запустить backend
cd apps/backend && pnpm start:prod

# запустить frontend (в другом терминале)
cd apps/frontend && node .output/server/index.mjs
```

### Docker — все сервисы

Нужны корневой `.env` и `apps/*/.env` (см. [«Конфигурация окружения»](#конфигурация-окружения)) — без них `docker compose` откажется стартовать (`no port specified` без корневого `.env`, `env file ... not found` без `apps/*/.env`).

```bash
docker network create template-nest-nuxt_app  # только первый раз
pnpm env:copy                                 # только первый раз, если .env ещё нет
docker compose up --build
```

`pnpm env:copy` создаёт из `.env.example` все `.env`, которых ещё нет (корневой, `apps/backend`, `apps/frontend`, `apps/docs`), и ничего больше не делает — не проверяет порты, не запускает Docker. Та же логика, что использует `predev`/`predocker` под капотом, доступная отдельно.

Если удобнее не следить за этим вручную вообще — `pnpm docker:up` делает то же самое, что и `docker compose up`, но перед стартом сама создаёт все `.env` из `.env.example` (если отсутствуют) и проверяет хост-порты на занятость. Полезно в первую очередь при первом запуске; если вы сами управляете `.env` и портами — можно просто продолжать пользоваться `docker compose` напрямую.

```bash
pnpm docker:up --build
```

- Backend: http://localhost:3500 (или `BACKEND_HOST_PORT` из `.env`)
- Frontend: http://localhost:3600 (или значение `FRONTEND_HOST_PORT` из `.env`)
- Docs: http://localhost:3700 (или `DOCS_HOST_PORT` из `.env`)

Остановить:

```bash
docker compose down
```

### Docker — по одному сервису

```bash
docker build -f apps/backend/Dockerfile -t my-backend .
docker run -p 3100:3100 -e PORT=3100 -e CORS_ORIGIN_SCHEME_HOST=http://localhost -e CORS_ORIGIN_PORT=3200 my-backend
```

```bash
docker build -f apps/frontend/Dockerfile -t my-frontend .
docker run -p 3200:3200 -e BACKEND_URL=http://localhost:3100 my-frontend
```

```bash
docker build -f apps/docs/Dockerfile -t my-docs .
docker run -p 8080:80 -e PORT=80 my-docs
```

> **Важно:** при запуске контейнеров по отдельности они не видят друг друга по имени сервиса.
> Если нужно чтобы frontend достучался до backend — создайте общую сеть вручную:
>
> ```bash
> docker network create my-app
> docker run -p 3100:3100 --network my-app --name backend my-backend
> docker run -p 3200:3200 --network my-app -e BACKEND_URL=http://backend:3100 my-frontend
> ```

Подробнее про Docker-схему (хост-порты vs внутренние порты, `envsubst` для `docs`, `USER node`, `HEALTHCHECK`) — см. [`apps/docs/guide/docker.md`](apps/docs/guide/docker.md).

---

## Прочие команды

```bash
pnpm install        # установить зависимости
pnpm dev            # запустить всё параллельно
pnpm build          # собрать все workspace'ы
pnpm lint           # проверить линтером
pnpm type-check     # проверить типы
```

- Backend API: http://localhost:3100
- Backend health: http://localhost:3100/health
- Frontend: http://localhost:3200
- Frontend health: http://localhost:3200/api/health
- Docs (только dev, `pnpm dev`): http://localhost:5173
