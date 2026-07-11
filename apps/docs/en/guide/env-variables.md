# ENV Variables

## Files

```
apps/backend/.env[.example]  # Read directly by NestJS
apps/frontend/.env[.example] # Read directly by Nuxt
```

- Each application reads **only its own** `.env`
- If `.env` is missing, it is **automatically** copied from `.env.example` when running `pnpm dev` (via `predev.mjs`)

---

## Why variables are duplicated

### `BACKEND_URL` vs `NUXT_PUBLIC_BACKEND_URL`

Both mean "backend address", but for different consumers:

| Variable                  | File                 | Who reads it      | Value                                   |
| ------------------------- | -------------------- | ----------------- | --------------------------------------- |
| `BACKEND_URL`             | `apps/frontend/.env` | Nuxt SSR (server) | `http://localhost:3001` with `pnpm dev` |
| `NUXT_PUBLIC_BACKEND_URL` | `apps/frontend/.env` | Browser           | `http://localhost:3001`                 |

In Docker both values are passed directly via `docker-compose.yml`: `BACKEND_URL` as `http://backend:3001` (the service name inside the Docker network), `NUXT_PUBLIC_BACKEND_URL` as `http://localhost:3001`.

`NUXT_PUBLIC_` is Nuxt's mandatory prefix for variables exposed to the browser. The duplication can't be removed: it's a framework constraint.

### `CORS_ORIGIN`

Only in `apps/backend/.env` for local runs (`pnpm dev`). In Docker it's passed directly via `docker-compose.yml`.

---

## Diagram: what is read from where

### `pnpm dev`

```
apps/backend/.env   →  PORT, CORS_ORIGIN
apps/frontend/.env  →  PORT, NUXT_PUBLIC_BACKEND_URL, BACKEND_URL
```

### Docker

```
docker-compose.yml (values hardcoded)
  backend:   PORT=3001, CORS_ORIGIN=http://localhost:3000
  frontend:  NUXT_PUBLIC_API_BASE=/api/backend,
             NUXT_PUBLIC_APP_ENV=production,
             NUXT_PUBLIC_BACKEND_URL=http://localhost:3001,
             BACKEND_URL=http://backend:3001
```

---

## `predev.mjs`

Runs automatically before `pnpm dev` (npm `pre*` convention). It does two things:

1. If `apps/backend/.env` or `apps/frontend/.env` is missing — copies it from `.env.example`
2. If the required port is busy — offers to kill the process on it or abort the start

For more on run modes, see [Development](/en/guide/development).
