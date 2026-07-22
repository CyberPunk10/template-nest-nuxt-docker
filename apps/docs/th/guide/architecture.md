# สถาปัตยกรรมของ monorepo

## Packages และ dependencies

```
template-nest-nuxt/
├── apps/
│   ├── backend    (@repo/backend)    NestJS
│   ├── frontend   (@repo/frontend)   Nuxt 4
│   └── docs       (@repo/docs)       VitePress (อยู่หลัง nginx ใน Docker)
└── packages/
    ├── shared     (@repo/shared)     TypeScript types + i18n
    └── ui         (@repo/ui)         Vue components

Dependencies (workspace:*):

  frontend ──► shared
  frontend ──► ui
  backend  ──► shared

  ui และ shared ไม่ dependency กับอะไรอื่นภายใน monorepo
  backend ไม่รู้จัก frontend เลย — เชื่อมกันแค่ผ่าน HTTP

การเชื่อมต่อระหว่างแอป:

  frontend ──► [HTTP /api/backend/*] ──► backend
               (Nuxt server proxy,
                ไม่มี CORS ใน dev)

  Nuxt proxy /api/backend/* ไปที่ http://localhost:3100
  ใน prod proxy จะถูกกำหนดผ่านตัวแปร NUXT_PUBLIC_API_BASE
```

## Packages: ใช้งานอย่างไร

```
@repo/shared
  Compile เป็น dist/ (ESM, tsc)
  Backend และ frontend ใช้โค้ดที่ compile แล้ว
  ต้อง compile เพราะ backend เป็น CommonJS
  ส่วน frontend เป็น ESM/Rollup; dist/ ที่ใช้ร่วมกันทำงานได้กับทั้งสอง

@repo/ui
  Source-only ไม่ต้อง compile
  ใช้เฉพาะฝั่ง frontend ผ่าน Vite
  ซึ่งจัดการไฟล์ .vue และ .ts ได้โดยตรง
  ไม่สามารถ compile ด้วย tsc ธรรมดาได้ — ไฟล์ .vue
  ต้องใช้ vue-tsc + pipeline เฉพาะ
```

## TypeScript configs

```
tsconfig.base.json               ← root ของ monorepo ใช้แค่สำหรับ IDE และ type-check
│  strict, ES2022
│  paths: {
│    "@repo/shared" → packages/shared/dist/index.d.ts   ← types ที่ compile แล้ว
│    "@repo/ui"     → packages/ui/src/index.ts           ← source (source-only)
│  }
│  paths เหล่านี้ IDE ใช้แค่เพื่อ resolve types เท่านั้น
│  ตอน runtime โมดูลจะถูก resolve ผ่าน pnpm workspace (package.json → main)
│
├── shared/tsconfig.json
│      rootDir: ./src  outDir: ./dist
│      module: ESNext  moduleResolution: bundler
│      Compile เป็น ESM — จำเป็นสำหรับ Rollup (Nuxt)
│
├── frontend/tsconfig.json  ← Nuxt สร้างให้อัตโนมัติ ห้ามแก้
│
├── ui/tsconfig.json        ← ไม่ extend base (ต้องใช้ jsx + DOM lib)
│      source-only package ไม่ต้องมี dist — Nuxt/Vite จัดการไฟล์ .vue โดยตรง
│      ใช้แค่สำหรับ vue-tsc --noEmit (type-check)
│
└── backend/tsconfig.json        ← สำหรับ IDE และ type-check, noEmit: true
       module: commonjs
       experimentalDecorators: true   ← จำเป็นสำหรับ NestJS decorators
       │
       └── backend/tsconfig.build.json   ← สำหรับ nest build, noEmit: false
              rootDir: ./src             ← ได้ dist/main.js ที่สะอาด
              outDir: ./dist             ← ไม่มี path ซ้อนแบบ apps/backend/src/...
```
