# สคริปต์

## `package.json`

ใน monorepo มี `package.json` ทั้งหมด 4 ไฟล์ — ไฟล์ root และอีกหนึ่งไฟล์ต่อ `apps/*` สคริปต์ในแต่ละไฟล์ไม่ทับซ้อนกัน: สคริปต์ที่ root จะคุมทั้ง monorepo (`pnpm -r ...`, Docker, `.env`) ส่วน per-app จะทำงานแค่ภายใน workspace ของตัวเอง และมักถูกเรียกผ่าน filter (`pnpm --filter backend dev`) หรือถูกเรียกทางอ้อมจากสคริปต์ที่ root

### Root

| สคริปต์ | คำสั่ง | ทำอะไร |
| --- | --- | --- |
| `env:copy` | `node scripts/copy-env-cli.mjs` | สร้าง `.env` ที่ขาดหายทั้งหมดจาก `.env.example` — ไม่รันหรือตรวจสอบอะไรอย่างอื่น |
| `predev` | `node scripts/predev.mjs` | รันอัตโนมัติก่อน `dev` (npm `pre*` convention) |
| `dev` | `node scripts/dev.mjs` | เปิด backend, frontend และ docs พร้อมกัน (ผ่าน `concurrently`) |
| `predocker:up` | `node scripts/predocker.mjs` | รันอัตโนมัติก่อน `docker:up` |
| `docker:up` | `docker compose up` | เปิดทั้งสาม service ใน Docker |
| `build` | `pnpm -r build` | Build workspace package ทั้งหมด (รัน `build` ใน `apps/*` แต่ละตัว) |
| `lint` | `pnpm -r lint` | รัน linter กับ workspace package ทั้งหมด |
| `type-check` | `pnpm -r type-check` | ตรวจสอบ type ของ workspace package ทั้งหมด |
| `reinstall` | `node scripts/reinstall.mjs` | ลบ `node_modules`/`pnpm-lock.yaml` แล้วติดตั้ง dependency ใหม่ทั้งหมด |
| `prepare` | `husky` | ตั้งค่า git hook (เรียกอัตโนมัติตอน `pnpm install`) |

### `apps/backend`

| สคริปต์ | คำสั่ง | ทำอะไร |
| --- | --- | --- |
| `dev` | `nest start --watch` | Develop ในเครื่อง มี hot-reload |
| `build` | `nest build` | Production build เป็น `dist/` |
| `start` | `nest start` | รัน `dist/` ที่ build แล้วโดยไม่มี watch |
| `start:prod` | `node dist/main` | รันในโหมด production (สิ่งที่ `Dockerfile` ใช้) |
| `lint` | `eslint ... --fix` | Linter พร้อม auto-fix |
| `type-check` | `tsc --noEmit` | ตรวจสอบ type โดยไม่ build |
| `test` / `test:watch` / `test:cov` / `test:e2e` | `jest ...` | Unit test และ e2e test |

### `apps/frontend`

| สคริปต์ | คำสั่ง | ทำอะไร |
| --- | --- | --- |
| `dev` | `nuxt dev` | Develop ในเครื่อง มี hot-reload |
| `build` | `nuxt build` | Production build เป็น `.output/` |
| `preview` | `nuxt preview` | รัน production build ในเครื่อง |
| `postinstall` | `nuxt prepare` | สร้าง `.nuxt/` (types, aliases) — รันอัตโนมัติหลัง `pnpm install` |
| `lint` | `eslint . --fix` | Linter พร้อม auto-fix |
| `type-check` | `nuxt typecheck` | ตรวจสอบ type ผ่าน `vue-tsc` |

### `apps/docs`

| สคริปต์ | คำสั่ง | ทำอะไร |
| --- | --- | --- |
| `dev` | `vitepress dev` | Dev server ของเอกสารในเครื่อง |
| `build` | `vitepress build` | Static build เป็น `.vitepress/dist/` |
| `preview` | `vitepress preview` | รันเอกสารที่ build แล้วในเครื่อง |

## Node script ใน `scripts/`

npm script ที่ root ส่วนใหญ่ข้างบนเป็นแค่ thin wrapper ครอบไฟล์ใน `scripts/` ด้านล่างนี้คือสิ่งที่แต่ละตัวทำจริงๆ

### `predev.mjs`, `predocker.mjs`

ทั้งสองสคริปต์รันอัตโนมัติ (`predev.mjs` — ก่อน `pnpm dev`, `predocker.mjs` — ก่อน `pnpm docker:up` ผ่าน npm `pre*` convention) และทำสองอย่างเดียวกัน:

1. **คัดลอก `.env.example` → `.env`** ทั้งสี่ไฟล์พร้อมกัน (root, `apps/backend`, `apps/frontend`, `apps/docs`) — ผ่าน `copyEnvFiles()` ที่ใช้ร่วมกันจาก `copy-env.mjs` ไม่ใช่แค่ "ของตัวเอง": แม้แต่ `predev.mjs` ที่รันก่อน develop ในเครื่อง ก็สร้าง `.env` ที่ root ให้ด้วยถ้ายังไม่มี
2. **ตรวจสอบพอร์ตและแก้ปัญหาชนกัน** — ผ่าน `checkPorts()` ที่ใช้ร่วมกันจาก `check-ports.mjs` ถ้าชนกันจะเสนอ dialog: kill process ที่ครองพอร์ตอยู่ หรือยกเลิกการรัน

ต่างกันแค่ *พอร์ตไหน* ที่แต่ละตัวตรวจสอบ:

- `predev.mjs` — dev port (`PORT` จาก `apps/backend/.env`, `apps/frontend/.env`, `apps/docs/.env`)
- `predocker.mjs` — host port (`BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT` จาก `.env` ที่ root)

::: warning
สิ่งนี้จะทำงานแค่ก่อน `pnpm docker:up` เท่านั้น ไม่ใช่ก่อน `docker compose up` ตรงๆ ถ้าเรียก `docker compose up` ตรงๆ โดยไม่ผ่าน npm wrapper บน clone ใหม่ที่ยังไม่มี `.env` — คำสั่งจะปฏิเสธไม่ start: ตัวแปรพอร์ตใน `docker-compose.yml` ไม่มีค่า default (`no port specified` ถ้าไม่มี `.env` ที่ root) และ `env_file` สำหรับ `apps/*/.env` จำเป็นต้องมีโดย default (`env file ... not found`) และจะไม่มีการตรวจสอบพอร์ตชนกันแบบชัดเจนด้วย — ถ้า host port ถูกใช้อยู่ จะได้ Docker error ธรรมดา `address already in use` โดยไม่มี dialog เสนอให้ปล่อยพอร์ต สร้าง `.env` ที่ขาดหายไว้ล่วงหน้าโดยไม่ต้องรันอะไร: `pnpm env:copy`
:::

### `copy-env.mjs`, `copy-env-cli.mjs`

`copy-env.mjs` คือ module ที่ใช้ร่วมกัน เก็บ path ของ `.env`/`.env.example` ทั้งหมด (`ROOT_ENV`, `BACKEND_ENV`, `FRONTEND_ENV`, `DOCS_ENV` และตัวแปร `_EXAMPLE` ของแต่ละตัว) และฟังก์ชัน `copyEnvFiles()` ที่คัดลอกทั้งสี่ไฟล์พร้อมกันถ้ายังไม่มี ถูก import ทั้งจาก `predev.mjs`/`predocker.mjs` และจาก `copy-env-cli.mjs`

`copy-env-cli.mjs` เป็น CLI runner แบบบาง: เรียก `copyEnvFiles()` แค่ครั้งเดียว ไม่มีอะไรมากกว่านั้น แยกออกจาก `copy-env.mjs` เพื่อให้ตัว module เองสะอาด (ไม่มี side effect ตอน import) — side effect ทั้งหมดอยู่ในไฟล์นี้ไฟล์เดียว ซึ่งถูกเรียกจาก npm script `env:copy` เท่านั้น

### `check-ports.mjs`

Module ที่ใช้ร่วมกัน เก็บ utility เกี่ยวกับพอร์ต:

- `isPortFree(port)` — ตรวจสอบว่าพอร์ตว่างบน `127.0.0.1` หรือไม่
- `killPort(port)` — kill process ที่ครองพอร์ตอยู่ (ผ่าน `lsof`/`kill` เฉพาะ macOS/Linux)
- `requirePort(envPath, key)` — อ่านตัวแปรพอร์ตที่จำเป็นจาก `.env` ถ้าไม่มีหรือค่าไม่ถูกต้องจะโยน error ที่บอกชัดเจนว่าไฟล์ไหน
- `checkPorts(services)` — ตรวจสอบ list ของ service (`{ name, envPath, key }`) ถ้าชนกันจะแสดง dialog เสนอให้ kill process ที่ครองพอร์ตอยู่ หรือยกเลิกการรัน

`predev.mjs` และ `predocker.mjs` ใช้ `checkPorts()` ตัวเดียวกัน แค่ส่ง list ของ service ต่างกันไป — logic ของ dialog และการ kill process ไม่ถูกเขียนซ้ำระหว่างสองสคริปต์

### `dev.mjs`

Wrapper ครอบ [`concurrently`](https://www.npmjs.com/package/concurrently) — รันสามคำสั่ง dev (`pnpm --filter backend dev`, `pnpm --filter frontend dev`, `pnpm --filter docs dev`) เป็น process เดียว มี output รวมกัน:

```js
concurrently(
  [
    { command: 'pnpm --filter backend dev', name: 'Nest' },
    { command: 'pnpm --filter frontend dev', name: 'Nuxt' },
    { command: 'pnpm --filter docs dev', name: 'Docs' },
  ],
  { prefixColors: ['#e0234e', '#ffca28', '#55a5d3'] },
)
```

ทำไมต้องใช้ `concurrently` โดยเฉพาะ ไม่ใช่สามคำสั่งพร้อมกันด้วย `&` ใน shell script:

- **Prefix มีชื่อและสี** — ทุกบรรทัดของ output จะมี tag `[Nest]`/`[Nuxt]`/`[Docs]` ในสีของตัวเอง (`prefixColors`) แทนที่จะเป็น stream ปนกันโดยไม่รู้ที่มา — ไม่งั้นจะบอกไม่ได้ว่า process ไหน log อะไรออกมา
- **Ctrl+C ครั้งเดียว** — `concurrently` จะ intercept signal แล้วหยุด process ลูกทั้งสามพร้อมกันอย่างถูกต้อง `&` เฉยๆ ใน shell ทำแบบนี้ไม่ได้: `Ctrl+C` จะ kill แค่ process ที่อยู่ foreground ส่วน backend/frontend/docs จะยังค้างอยู่ใน background แล้วครองพอร์ตต่อไป
- **ใช้ได้ข้าม platform** — ทำงานเหมือนกันทั้งใน bash/zsh และใน shell ของ Windows โดยไม่ต้องพึ่ง `&`/`wait` ที่พฤติกรรมต่างกันไปในแต่ละ shell

ถ้า process ใดใน 3 ตัวพัง โดย default `concurrently` จะไม่หยุดตัวอื่น (เปลี่ยนพฤติกรรมนี้ได้ผ่าน `killOthersOn` แต่ที่นี่ไม่ได้ตั้งไว้: การ develop backend ไม่ควรถูกขัดจังหวะแค่เพราะ docs มี build error ชั่วคราว)

### `reinstall.mjs`

ลบ `node_modules` และ `pnpm-lock.yaml` (ถ้ามี) แล้วรัน `pnpm install` ใหม่ทั้งหมด

::: warning ไม่ใช่วิธีอัปเดต dependency
การลบ `pnpm-lock.yaml` จะล้าง version ที่ล็อกไว้ของ transitive dependency ทั้งหมด — `pnpm install` จะ resolve ใหม่ภายในขอบเขตที่ `package.json` อนุญาต (`^`/`~`) ซึ่งหมายความว่าอาจดึง minor/patch version ใหม่ของ transitive package มาแบบเงียบๆ รวมถึง breaking change ที่อาจมีอยู่ในนั้นด้วย ในช่วงต้นของ template ที่ยังมี dependency ไม่เยอะ นี่เป็นวิธีที่ถูกในการแก้ปัญหา state ที่เพี้ยนในเครื่อง (เช่น หลังสลับ branch ที่มี lockfile ต่างกัน) แต่พอโปรเจกต์โตไปถึง production ที่ dependency tree นิ่งแล้ว ไม่ควรอัปเดตด้วยวิธีนี้อีก — การอัปเดต version ใดๆ ควรตั้งใจทำและเห็นได้ใน diff ของ `pnpm-lock.yaml` ไม่ใช่ผลจากการคำนวณใหม่ทั้งหมดตั้งแต่ต้น

วิธีที่ถูกต้องในการอัปเดต dependency คือ `pnpm update` (อัปเดตภายในขอบเขตจาก `package.json` แค่ต่อยอด lockfile เดิม ไม่ลบทิ้ง) หรือ `pnpm update --interactive` (แสดง list ของ update ที่มี ให้เลือกว่าจะรับตัวไหน) สำหรับอัปเดตทีละ package — `pnpm update <package>`
:::

มีประโยชน์ตอนที่ dependency ในเครื่องเพี้ยนไป (เช่น หลังสลับ branch ที่มี lockfile ต่างกัน) และต้องการเริ่มใหม่แบบสะอาด — แต่ไม่ใช่เครื่องมือที่ใช้ประจำวัน
