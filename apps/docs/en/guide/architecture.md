# Monorepo architecture

## Packages and dependencies

```
template-nest-nuxt/
├── apps/
│   ├── backend    (@repo/backend)    NestJS
│   ├── frontend   (@repo/frontend)   Nuxt 4
│   └── docs       (@repo/docs)       VitePress
└── packages/
    ├── shared     (@repo/shared)     TypeScript types + i18n
    └── ui         (@repo/ui)         Vue components

Dependencies (workspace:*):

  frontend ──► shared
  frontend ──► ui
  backend  ──► shared

  ui and shared don't depend on anything else inside the monorepo.
  backend knows nothing about frontend — the only link is over HTTP.

Link between the apps:

  frontend ──► [HTTP /api/backend/*] ──► backend
               (Nuxt server proxy,
                no CORS in dev)

  Nuxt proxies /api/backend/* to http://localhost:3100.
  In prod the proxy is configured via the NUXT_PUBLIC_API_BASE variable.
```

## Packages: how they're consumed

```
@repo/shared
  Source-only: package.json points main straight
  at src/index.ts, there is no build step.
  Backend compiles these sources along with its own
  (tsc), frontend goes through Vite.

@repo/ui
  Source-only. No compilation needed.
  Used only by the frontend via Vite,
  which handles .vue and .ts files directly.
  Can't be compiled with plain tsc — .vue files
  require vue-tsc + a dedicated pipeline.
```
