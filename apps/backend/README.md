# @repo/backend

NestJS API сервер. Работает на порту `3100`.

## Переменные окружения

| Переменная          | По умолчанию            | Описание                                |
| ------------------- | ----------------------- | ---------------------------------------- |
| `PORT`              | `3100`                  | Порт сервера                             |
| `CORS_ORIGIN_SCHEME_HOST`  | `http://localhost`      | Протокол+хост разрешённого origin для CORS |
| `CORS_ORIGIN_PORT`  | `3200`                  | Порт разрешённого origin для CORS (порт frontend'а) |

Скопируйте `.env.example` в `.env` и заполните нужные значения.

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
docker run -p 3100:3100 my-backend
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
