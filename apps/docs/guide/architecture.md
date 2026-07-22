# Архитектура монорепо

## Пакеты и зависимости

```
template-nest-nuxt/
├── apps/
│   ├── backend    (@repo/backend)    NestJS
│   ├── frontend   (@repo/frontend)   Nuxt 4
│   └── docs       (@repo/docs)       VitePress (в Docker — за nginx)
└── packages/
    ├── shared     (@repo/shared)     TypeScript типы + i18n
    └── ui         (@repo/ui)         Vue компоненты

Зависимости (workspace:*):

  frontend ──► shared
  frontend ──► ui
  backend  ──► shared

  ui и shared не зависят ни от кого внутри монорепо.
  backend не знает про frontend — связь только через HTTP.

Связь между приложениями:

  frontend ──► [HTTP /api/backend/*] ──► backend
               (Nuxt server proxy,
                без CORS в dev)

  Nuxt проксирует /api/backend/* на http://localhost:3100.
  В prod proxy настраивается через переменную NUXT_PUBLIC_API_BASE.
```

## Пакеты: как потребляются

```
@repo/shared
  Компилируется в dist/ (ESM, tsc).
  Backend и frontend получают скомпилированный код.
  Нужна компиляция, потому что backend — CommonJS,
  frontend — ESM/Rollup; общий dist/ работает для обоих.

@repo/ui
  Source-only. Компиляция не нужна.
  Используется только фронтендом через Vite,
  который обрабатывает .vue и .ts напрямую.
  Нельзя скомпилировать просто через tsc — .vue файлы
  требуют vue-tsc + специального пайплайна.
```

## TypeScript конфиги

```
tsconfig.base.json               ← корень монорепо, только для IDE и type-check
│  strict, ES2022
│  paths: {
│    "@repo/shared" → packages/shared/dist/index.d.ts   ← скомпилированные типы
│    "@repo/ui"     → packages/ui/src/index.ts           ← исходник (source-only)
│  }
│  Эти пути нужны только IDE для резолва типов.
│  В рантайме модули резолвятся через pnpm workspace (package.json → main).
│
├── shared/tsconfig.json
│      rootDir: ./src  outDir: ./dist
│      module: ESNext  moduleResolution: bundler
│      Компилируется в ESM — нужно для Rollup (Nuxt).
│
├── frontend/tsconfig.json  ← генерируется Nuxt автоматически, не трогать
│
├── ui/tsconfig.json        ← НЕ наследует base (нужен jsx + DOM lib)
│      source-only пакет, dist не нужен — Nuxt/Vite обрабатывает .vue напрямую
│      Используется только для vue-tsc --noEmit (type-check).
│
└── backend/tsconfig.json        ← для IDE и type-check, noEmit: true
       module: commonjs
       experimentalDecorators: true   ← нужно для NestJS декораторов
       │
       └── backend/tsconfig.build.json   ← для nest build, noEmit: false
              rootDir: ./src             ← даёт чистый dist/main.js
              outDir: ./dist             ← без вложенных путей apps/backend/src/...
```
