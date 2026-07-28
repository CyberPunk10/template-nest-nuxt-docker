# เริ่มต้นใช้งาน

มีสองวิธีในการรันโปรเจกต์ — **pnpm** หรือ **Docker** แต่ละแบบมี dev/production ของตัวเอง:

|            | Development                                                 | Production                                                                                             |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **pnpm**   | [`pnpm dev`](#pnpm-dev) — พัฒนาแบบวันต่อวัน มี hot-reload เร็วที่สุด | [`pnpm build`](#pnpm-build-production-build-ไม่ผ่าน-docker) — ตรวจสอบ production build โดยไม่ใช้ container |
| **Docker** | ยังไม่รองรับ — ดูหมายเหตุในหัวข้อ [Docker](#docker-—-ทุก-service)   | [`docker compose up`](#docker-—-ทุก-service) — production stack ใน container เหมือนตอน deploy จริง        |

## เตรียมความพร้อม

### 1. Node.js ≥ 24

```bash
node -v
```

Version ถูกล็อกไว้ใน `.nvmrc` และ `engines` ของ `package.json` ที่ root `.npmrc` มี `engine-strict=true` — `pnpm install` จะ **ปฏิเสธ** ติดตั้ง dependency บน Node version ที่ไม่รองรับ แทนที่จะติดตั้งเงียบๆ แล้วไปพังตอน runtime ทีหลัง

::: details วิธีติดตั้ง (nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
```

จากนั้นที่ root ของ repo (ที่มี `.nvmrc` อยู่):

```bash
nvm install 24
nvm use 24
```

รายละเอียดเพิ่มเติม — [nvm-sh/nvm](https://github.com/nvm-sh/nvm)
:::

### 2. pnpm ≥ 11 ผ่าน Corepack

```bash
pnpm --version
```

Version ของ pnpm ถูกล็อกไว้ใน `packageManager` ของ `package.json` ที่ root — วิธีที่แนะนำในการติดตั้งคือผ่าน [Corepack](https://nodejs.org/api/corepack.html) ที่มากับ Node.js อยู่แล้ว

::: details วิธีติดตั้ง (Corepack)
```bash
corepack enable
```

จากนั้น `pnpm` ในโปรเจกต์นี้จะเป็น version ที่ระบุไว้ใน `packageManager` ถ้ามี pnpm อื่นติดตั้งแบบ global อยู่แล้ว มันอาจ intercept การเรียกก่อนที่ Corepack shim จะทำงาน ทำให้ได้ `pnpm` คนละ version ตรวจสอบ version ด้วย `pnpm --version` ถ้าไม่ตรงกับที่ระบุใน `packageManager` ให้ดู [pnpm และ Corepack](/th/guide/pnpm)
:::

### 3. Docker + Docker Compose

```bash
docker --version
docker compose version
```

::: details วิธีติดตั้ง
คำแนะนำแบบเต็มตาม OS ของคุณ — [docs.docker.com/get-started/get-docker](https://docs.docker.com/get-started/get-docker/)

วิธีเร็วสำหรับ Linux:

```bash
curl -fsSL https://get.docker.com | sh
```
:::

### 4. Docker network

```bash
docker network create template-nest-nuxt_app
```

จำเป็นแค่สำหรับโหมด Docker เท่านั้น ทำครั้งเดียว Network ถูกประกาศไว้ใน `docker-compose.yml` เป็น `external: true` — `docker compose` คาดหวังว่ามีอยู่แล้ว ไม่ได้สร้างให้เอง ถ้าข้ามขั้นตอนนี้ `docker compose up` จะ fail ด้วย error `network ... declared as external, but could not be found`

### 5. ไฟล์ `.env`

ไม่จำเป็นต้องคัดลอก `.env.example` → `.env` เองด้วยมือ — ตอนรันครั้งแรก script wrapper จะทำให้ (`pnpm dev` → `predev.mjs`, `pnpm docker:up` → `predocker.mjs`) — ทั้งสองจะสร้าง `.env` **ทั้งหมด** ที่ยังไม่มี: root, `apps/backend`, `apps/frontend`, `apps/docs`

ถ้าต้องการสร้างไว้ล่วงหน้า — เช่นก่อนรัน `docker compose up` ตรงๆ โดยไม่ผ่าน `pnpm docker:up` — มีคำสั่งแยกที่ทำแค่นี้:

```bash
pnpm env:copy
```

รายละเอียดเพิ่มเติมว่าตัวแปรไหนอยู่ที่ไหนและทำไม — ดู [ตัวแปรสภาพแวดล้อม (ENV)](/th/guide/env-variables)

## pnpm dev

```bash
pnpm dev
```

คำสั่งเดียวเปิดทุกอย่างแบบ native พร้อม hot-reload ในแต่ละ service ก่อน start จะรัน `predev.mjs` (ดูข้อ 5 ด้านบน): สร้าง `.env` ถ้ายังไม่มี และแก้ปัญหาพอร์ตชนกัน

| Service  | URL                     | เทคโนโลยี         |
| -------- | ----------------------- | ---------------- |
| Backend  | `http://localhost:3100` | NestJS `--watch` |
| Frontend | `http://localhost:3200` | Nuxt dev         |
| Docs     | `http://localhost:5173` | VitePress dev    |

::: tip
ตอนสลับ branch `.env` ในเครื่องจะไม่อัปเดตอัตโนมัติ — อาจขาดตัวแปรของ branch ใหม่ไป เทียบกับ `.env.example` แล้วเพิ่มตัวที่ขาดเข้าไป
:::

## pnpm build (production build ไม่ผ่าน Docker)

ตรวจสอบ production build โดยไม่ใช้ container:

```bash
pnpm build

# รัน backend
cd apps/backend && pnpm start:prod

# รัน frontend (อีก terminal หนึ่ง)
cd apps/frontend && node .output/server/index.mjs
```

## Docker — ทุก service

::: info
โหมด production เท่านั้น — `docker compose up` จะ build และรัน production image เสมอ (multi-stage build ไม่ mount source เข้าไปเป็น volume) ยังไม่มีโหมด Docker dev ที่รองรับ hot-reload — สำหรับ development ให้ใช้ [`pnpm dev`](#pnpm-dev)
:::

```bash
pnpm docker:up --build
```

`pnpm docker:up` ไม่ใช่แค่ alias ของ `docker compose up`: ก่อน start จะรัน `predocker.mjs` (ดูข้อ 5 ด้านบน) — สร้าง `.env` ที่ root ถ้ายังไม่มี และตรวจสอบว่า host port ถูกใช้อยู่หรือไม่ ถ้าชนกันจะเสนอให้ kill process ที่ครองพอร์ตอยู่

- Backend: `http://localhost:3500` (หรือ `BACKEND_HOST_PORT` จาก `.env`)
- Frontend: `http://localhost:3600` (หรือค่า `FRONTEND_HOST_PORT` จาก `.env`)
- Docs: `http://localhost:3700` (หรือ `DOCS_HOST_PORT` จาก `.env`)

::: warning
`docker compose up` ตรงๆ โดยไม่ผ่าน `pnpm docker:up` ก็ทำงานได้เหมือนกัน แต่ไม่มีการเตรียมความพร้อมให้ — ถ้าไม่มี `.env` ที่ root จะปฏิเสธไม่ start (`no port specified`) ถ้าไม่มี `apps/*/.env` ก็จะปฏิเสธเช่นกัน (`env file ... not found`) และถ้า host port ถูกใช้อยู่แล้ว จะได้ Docker error ธรรมดา `address already in use` โดยไม่มี dialog เสนอให้ปล่อยพอร์ต
:::

รายละเอียดเรื่อง scheme ของพอร์ต, `env_file`/`environment` override, ทำไมต้องมี `USER node` และ `HEALTHCHECK` — ดู [Docker](/th/guide/docker)

## หยุดการทำงาน

Docker compose:

```bash
docker compose down
```

Network `template-nest-nuxt_app` จะไม่ถูกลบ — เพราะเป็น `external` compose ไม่ได้สร้างเอง จึงไม่ใช่หน้าที่ compose ที่จะลบ ลบเองด้วยมือถ้าไม่ต้องการแล้ว:

```bash
docker network rm template-nest-nuxt_app
```

## Docker — ทีละ service

สามารถ build และรัน `backend`, `frontend` หรือ `docs` เป็น container แยกได้ โดยไม่ต้องใช้ `docker compose` — เช่น เพื่อตรวจสอบ image เดียวแบบเจาะจง

ดูคำสั่งสำหรับรันแต่ละ service แยกกันได้ที่หัวข้อ [Docker](/th/guide/docker)
