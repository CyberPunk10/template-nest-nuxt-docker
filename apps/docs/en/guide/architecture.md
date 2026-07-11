# Monorepo architecture

## Packages and dependencies

```
template-nest-nuxt/
├── apps/
│   ├── frontend   (@repo/frontend)   Nuxt 4 · :3000
│   └── backend    (@repo/backend)    NestJS  · :3001
└── packages/
    ├── shared     (@repo/shared)     TypeScript types + i18n
    └── ui         (@repo/ui)         Vue components

Dependencies (workspace:*):

  frontend ──► shared
  frontend ──► ui
  backend  ──► shared

  ui and shared depend on nothing else inside the monorepo.
  backend knows nothing about frontend — the only link is over HTTP.

Link between the applications:

  frontend ──► [HTTP /api/backend/*] ──► backend
               (Nuxt server proxy,
                no CORS in dev)

  Nuxt proxies /api/backend/* to http://localhost:3001.
  In prod the proxy is configured via the NUXT_PUBLIC_API_BASE variable.
```

## Packages: how they are consumed

```
@repo/shared
  Compiled into dist/ (ESM, tsc).
  Backend and frontend consume the compiled code.
  Compilation is required because backend is CommonJS
  and frontend is ESM/Rollup; a shared dist/ works for both.

@repo/ui
  Source-only. No compilation needed.
  Consumed only by the frontend via Vite,
  which handles .vue and .ts files directly.
  It can't just be compiled with tsc — .vue files
  require vue-tsc plus a dedicated pipeline.
```

## TypeScript configs

```
tsconfig.base.json               ← monorepo root, for IDE and type-check only
│  strict, ES2022
│  paths: {
│    "@repo/shared" → packages/shared/dist/index.d.ts   ← compiled types
│    "@repo/ui"     → packages/ui/src/index.ts           ← source (source-only)
│  }
│  These paths are only for the IDE to resolve types.
│  At runtime, modules are resolved via the pnpm workspace (package.json → main).
│
├── shared/tsconfig.json
│      rootDir: ./src  outDir: ./dist
│      module: ESNext  moduleResolution: bundler
│      Compiled to ESM — required for Rollup (Nuxt).
│
├── frontend/tsconfig.json  ← generated automatically by Nuxt, don't touch
│
├── ui/tsconfig.json        ← does NOT extend base (needs jsx + DOM lib)
│      source-only package, no dist needed — Nuxt/Vite handles .vue directly
│      Used only for vue-tsc --noEmit (type-check).
│
└── backend/tsconfig.json        ← for IDE and type-check, noEmit: true
       module: commonjs
       experimentalDecorators: true   ← required for NestJS decorators
       │
       └── backend/tsconfig.build.json   ← for nest build, noEmit: false
              rootDir: ./src             ← produces a clean dist/main.js
              outDir: ./dist             ← without nested apps/backend/src/... paths
```

## Docker: build stages

Both services are built in two stages:

```
  [ builder ]                          [ runner ]
  ───────────                          ──────────
  COPY package.json manifests          Final image.
  pnpm install --frozen-lockfile       Only what's needed to run.
  COPY sources
  Build the project.

  Backend additionally runs pnpm deploy --prod /deploy
  — copies only @repo/backend's dependencies out of node_modules,
  without the extra monorepo packages. The runner gets a clean, flat node_modules.

  Frontend doesn't do this — Nuxt bundles all dependencies
  into .output during the build. The runner needs no node_modules at all.

  Why does install come before COPYing the sources?
  Docker caches layer by layer — if the sources changed
  but package.json didn't, install is taken from the cache.
  Order: COPY manifests → pnpm install → COPY . .
```

**Backend builder:**

```
1. pnpm install --frozen-lockfile   ← installs all monorepo dependencies
                                       --frozen-lockfile guarantees the exact versions
                                       used in local development
2. pnpm build @repo/shared          ← compiles shared to ESM (dist/)
                                       required before nest build, since backend imports from dist/
3. nest build                       ← compiles backend into dist/
4. pnpm deploy --prod /deploy       ← copies only the required dependencies into /deploy
                                       doesn't re-download — takes them from node_modules
```

**Backend runner:**

```
/app/
├── node_modules/                 ← only @repo/backend's dependencies (pnpm deploy)
│                                    flat structure, without extra monorepo packages
└── dist/
    └── main.js                   ← compiled code (rootDir: ./src → clean path)

CMD: node dist/main
```

**Frontend runner:**

```
/app/
└── .output/                      ← Nuxt bundles everything here during the build
    ├── server/
    │   └── index.mjs             ← entry point (Node.js server)
    └── public/                   ← static assets (JS, CSS, assets)

CMD: node .output/server/index.mjs

No node_modules needed — all dependencies are already inside .output.
.output can be copied to a server and run without pnpm.
```
