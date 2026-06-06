# @repo/backend

NestJS API сервер. Работает на порту `3001`.

## Переменные окружения

| Переменная    | По умолчанию            | Описание                    |
| ------------- | ----------------------- | --------------------------- |
| `PORT`        | `3001`                  | Порт сервера                |
| `CORS_ORIGIN` | `http://localhost:3000` | Разрешённый origin для CORS |

Скопируй `.env.example` в `.env` и заполни нужные значения.

## Запуск

### Dev (из корня монорепо)

```bash
pnpm dev
```

### Dev (только backend)

```bash
pnpm --filter @repo/backend dev
```

### Production-сборка

```bash
pnpm --filter @repo/backend build
pnpm --filter @repo/backend start:prod
```

### Docker

```bash
# из корня монорепо — контекст сборки должен быть корень,
# иначе @repo/shared недоступен при COPY
docker build -f apps/backend/Dockerfile -t my-backend .
docker run -p 3001:3001 my-backend
```

## Структура

```
src/
├── modules/
│   └── users/          ← Users CRUD (GET/POST/PUT/DELETE /users)
│       ├── dto/
│       ├── user.entity.ts
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
├── app.controller.ts   ← GET / и GET /health
├── app.module.ts
├── app.service.ts
└── main.ts             ← bootstrap: CORS, ValidationPipe, ConfigService
```
