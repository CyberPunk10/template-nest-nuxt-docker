# @repo/frontend

Nuxt 4 frontend. Работает на порту `3200`.

## Переменные окружения

| Переменная             | По умолчанию            | Описание                            |
| ---------------------- | ----------------------- | ----------------------------------- |
| `NUXT_PUBLIC_API_BASE` | `/api/backend`          | Префикс API для клиента (публичная) |
| `BACKEND_URL`          | `http://localhost:3100` | URL бекенда для server-side proxy   |

Скопируйте `.env.example` в `.env` и заполните нужные значения.

## Запуск

### Dev (из корня монорепо)

```bash
pnpm dev
```

### Dev (только frontend)

```bash
pnpm --filter @repo/frontend dev
```

### Production-сборка

```bash
pnpm --filter @repo/frontend build
node apps/frontend/.output/server/index.mjs
```

### Предпросмотр prod-сборки (Nuxt preview)

```bash
pnpm --filter @repo/frontend preview
```

### Docker

```bash
# из корня монорепо
docker build -f apps/frontend/Dockerfile -t my-frontend .
docker run -p 3200:3200 -e BACKEND_URL=http://localhost:3100 my-frontend
```

## Структура

```
app/
├── components/
│   └── DevPanel.vue      ← панель разработчика (статус сервисов, стек, команды)
├── composables/
│   └── myComposable.ts   ← свои composables
├── layouts/
│   └── default.vue       ← основной layout с DevPanel справа
├── pages/
│   └── index.vue         ← Users CRUD с i18n
└── app.vue

i18n/
└── i18n.config.ts        ← подключает переводы из @repo/shared

server/
└── api/
    ├── backend/[...path].ts  ← proxy: /api/backend/* → NestJS
    └── health.get.ts
```
