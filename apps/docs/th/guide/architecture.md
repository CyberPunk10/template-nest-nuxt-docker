# สถาปัตยกรรมของ monorepo

## Package และ dependency

```
template-nest-nuxt/
├── apps/
│   ├── frontend   (@repo/frontend)   Nuxt 4 · :3000
│   └── backend    (@repo/backend)    NestJS  · :3001
└── packages/
    ├── shared     (@repo/shared)     TypeScript types + i18n
    └── ui         (@repo/ui)         Vue components

Dependency (workspace:*):

  frontend ──► shared
  frontend ──► ui
  backend  ──► shared

  ui และ shared ไม่ขึ้นกับใครเลยภายใน monorepo
  backend ไม่รู้จัก frontend — เชื่อมต่อกันผ่าน HTTP เท่านั้น

การเชื่อมต่อระหว่างแอปพลิเคชัน:

  frontend ──► [HTTP /api/backend/*] ──► backend
               (Nuxt server proxy,
                ไม่มี CORS ใน dev)

  Nuxt proxy /api/backend/* ไปยัง http://localhost:3001
  ใน prod การ proxy ตั้งค่าผ่านตัวแปร NUXT_PUBLIC_API_BASE
```

## Package: ถูกนำไปใช้อย่างไร

```
@repo/shared
  Compile เป็น dist/ (ESM, tsc).
  Backend และ frontend รับโค้ดที่ compile แล้วไปใช้.
  ต้อง compile เพราะ backend เป็น CommonJS,
  frontend เป็น ESM/Rollup; dist/ ตัวเดียวใช้ได้กับทั้งคู่.

@repo/ui
  Source-only. ไม่ต้อง compile.
  ใช้โดย frontend ผ่าน Vite เท่านั้น,
  ซึ่งประมวลผล .vue และ .ts ได้โดยตรง.
  ไม่สามารถ compile ผ่าน tsc เฉยๆ ได้ — ไฟล์ .vue
  ต้องใช้ vue-tsc + pipeline พิเศษ.
```

## TypeScript config

```
tsconfig.base.json               ← root ของ monorepo, ใช้เฉพาะสำหรับ IDE และ type-check
│  strict, ES2022
│  paths: {
│    "@repo/shared" → packages/shared/dist/index.d.ts   ← types ที่ compile แล้ว
│    "@repo/ui"     → packages/ui/src/index.ts           ← source (source-only)
│  }
│  path เหล่านี้จำเป็นเฉพาะกับ IDE เพื่อ resolve types เท่านั้น.
│  ตอน runtime module จะถูก resolve ผ่าน pnpm workspace (package.json → main).
│
├── shared/tsconfig.json
│      rootDir: ./src  outDir: ./dist
│      module: ESNext  moduleResolution: bundler
│      Compile เป็น ESM — จำเป็นสำหรับ Rollup (Nuxt).
│
├── frontend/tsconfig.json  ← Nuxt generate ให้อัตโนมัติ, ห้ามแตะ
│
├── ui/tsconfig.json        ← ไม่ inherit จาก base (ต้องใช้ jsx + DOM lib)
│      package แบบ source-only, ไม่ต้องมี dist — Nuxt/Vite ประมวลผล .vue ได้โดยตรง
│      ใช้เฉพาะสำหรับ vue-tsc --noEmit (type-check).
│
└── backend/tsconfig.json        ← สำหรับ IDE และ type-check, noEmit: true
       module: commonjs
       experimentalDecorators: true   ← จำเป็นสำหรับ decorator ของ NestJS
       │
       └── backend/tsconfig.build.json   ← สำหรับ nest build, noEmit: false
              rootDir: ./src             ← ให้ dist/main.js ที่สะอาด
              outDir: ./dist             ← ไม่มี path ซ้อน apps/backend/src/...
```

## Docker: stage การ build

ทั้งสอง service ถูก build ในสอง stage:

```
  [ builder ]                          [ runner ]
  ───────────                          ──────────
  COPY manifest package.json           image สุดท้าย.
  pnpm install --frozen-lockfile       เฉพาะสิ่งที่จำเป็นต่อการรัน.
  COPY source
  build โปรเจกต์.

  Backend รัน pnpm deploy --prod /deploy เพิ่มเติม
  — copy เฉพาะ dependency ของ @repo/backend จาก node_modules,
  ไม่มี package เกินความจำเป็นของ monorepo. Runner ได้ node_modules แบบแบนที่สะอาด.

  Frontend ไม่ทำแบบนี้ — Nuxt แพ็ก dependency ทั้งหมดเอง
  ลงใน .output ตอน build. Runner ไม่ต้องมี node_modules เลย.

  ทำไม install ต้องมาก่อน COPY source?
  Docker cache เป็นชั้นๆ — ถ้า source เปลี่ยน
  แต่ package.json ไม่เปลี่ยน, install จะเอามาจาก cache.
  ลำดับ: COPY manifest → pnpm install → COPY . .
```

**Backend builder:**

```
1. pnpm install --frozen-lockfile   ← ติดตั้ง dependency ทั้งหมดของ monorepo
                                       --frozen-lockfile รับประกัน version ที่แม่นยำ
                                       เหมือนตอน develop ในเครื่อง
2. pnpm build @repo/shared          ← compile shared เป็น ESM (dist/)
                                       ต้องทำก่อน nest build เพราะ backend import จาก dist/
3. nest build                       ← compile backend เป็น dist/
4. pnpm deploy --prod /deploy       ← copy เฉพาะ dependency ที่จำเป็นไปยัง /deploy
                                       ไม่ดาวน์โหลดใหม่ — เอามาจาก node_modules
```

**Backend runner:**

```
/app/
├── node_modules/                 ← เฉพาะ dependency ของ @repo/backend (pnpm deploy)
│                                    โครงสร้างแบบแบน, ไม่มี package เกินของ monorepo
└── dist/
    └── main.js                   ← โค้ดที่ compile แล้ว (rootDir: ./src → path ที่สะอาด)

CMD: node dist/main
```

**Frontend runner:**

```
/app/
└── .output/                      ← Nuxt แพ็กทุกอย่างมาไว้ที่นี่ตอน build
    ├── server/
    │   └── index.mjs             ← จุดเริ่มต้น (Node.js server)
    └── public/                   ← static (JS, CSS, assets)

CMD: node .output/server/index.mjs

ไม่ต้องมี node_modules — dependency ทั้งหมดอยู่ใน .output แล้ว.
.output สามารถ copy ไปที่ server แล้วรันได้เลยโดยไม่ต้องใช้ pnpm.
```
