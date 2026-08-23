# Архитектура монорепо

## Пакеты и зависимости

```
template-nest-nuxt/
├── apps/
│   ├── backend    (@repo/backend)    NestJS
│   ├── frontend   (@repo/frontend)   Nuxt 4
│   └── docs       (@repo/docs)       VitePress
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
