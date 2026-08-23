# tsconfig.base.json

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
