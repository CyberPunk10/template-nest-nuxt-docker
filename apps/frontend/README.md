# @repo/frontend

Nuxt 4 frontend. Работает на порту `3000`.

## Переменные окружения

| Переменная             | По умолчанию            | Описание                            |
| ---------------------- | ----------------------- | ----------------------------------- |
| `NUXT_PUBLIC_API_BASE` | `/api/backend`          | Префикс API для клиента (публичная) |
| `BACKEND_URL`          | `http://localhost:3001` | URL бекенда для server-side proxy   |

Скопируй `.env.example` в `.env` и заполни нужные значения.

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
docker run -p 3000:3000 -e BACKEND_URL=http://localhost:3001 my-frontend
```

## Структура

```
app/
├── components/
│   └── DevPanel.vue      ← панель разработчика (статус сервисов, стек, команды)
├── composables/
│   └── useApi.ts         ← обёртка над useFetch/$fetch с базовым URL
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
