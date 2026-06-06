# Архитектура монорепо

## Пакеты и зависимости

```
template-nest-nuxt/
├── apps/
│   ├── frontend   (@repo/frontend)   Nuxt 4 · :3000
│   └── backend    (@repo/backend)    NestJS  · :3001
└── packages/
    ├── shared     (@repo/shared)     TypeScript типы + i18n
    └── ui         (@repo/ui)         Vue компоненты

Зависимости (workspace:*):

  frontend ──► shared
  frontend ──► ui
  backend  ──► shared

Связь между приложениями:

  frontend ──► [HTTP /api/backend/*] ──► backend
               (Nuxt server proxy,
                без CORS в dev)
```

---

## TypeScript конфиги

```
tsconfig.base.json          ← корень монорепо
│  strict, ES2022
│  paths: { "@repo/*": [...] }
│
├── shared/tsconfig.json
│      rootDir: ./src  outDir: ./dist
│
├── frontend/tsconfig.json  ← генерируется Nuxt, не трогать
│
├── ui/tsconfig.json        ← НЕ наследует base (нужен jsx + DOM)
│
└── backend/tsconfig.json   ← для IDE и type-check
       noEmit: true
       module: commonjs
       experimentalDecorators: true
       │
       └── backend/tsconfig.build.json   ← для nest build
              noEmit: false
              rootDir: ./src
              outDir: ./dist
```

---

## Docker: стадии сборки

Оба сервиса собираются в две стадии:

```
  [ builder ]                          [ runner ]
  ───────────                          ──────────
  COPY package.json манифесты          Финальный образ.
  pnpm install --frozen-lockfile       Только то, что нужно для запуска.
  COPY исходники
  Собираем проект.

  Backend дополнительно запускает pnpm deploy --prod /deploy
  — копирует из node_modules только зависимости @repo/backend,
  без лишних пакетов монорепо. Runner получает чистый плоский node_modules.

  Frontend этого не делает — Nuxt сам упаковывает все зависимости
  в .output при сборке. node_modules в runner не нужен вообще.

  Почему install идёт до COPY исходников?
  Docker кэширует послойно — если исходники изменились,
  но package.json нет, install берётся из кэша.
```

**Backend builder:**

```
1. pnpm install --frozen-lockfile   ← устанавливает все зависимости монорепо
2. pnpm build @repo/shared          ← компилирует shared в ESM (dist/)
3. nest build                       ← компилирует backend в dist/
4. pnpm deploy --prod /deploy       ← копирует только нужные зависимости в /deploy
```

**Backend runner:**

```
/app/
├── node_modules/                 ← только нужные зависимости (pnpm deploy)
└── dist/
    └── main.js                   ← скомпилированный код

CMD: node dist/main

pnpm deploy копирует из монорепо только зависимости @repo/backend —
никаких лишних пакетов, никакой вложенной структуры.
```

**Frontend runner:**

```
/app/
└── .output/                      ← Nuxt упаковывает всё сюда
    ├── server/
    │   └── index.mjs             ← точка входа
    └── public/                   ← статика

CMD: node .output/server/index.mjs

Почему нет node_modules?
Nuxt при сборке включает все зависимости прямо в .output.
```
