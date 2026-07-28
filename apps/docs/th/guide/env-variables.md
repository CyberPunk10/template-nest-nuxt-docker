# ตัวแปรสภาพแวดล้อม (ENV)

## ไฟล์

มี `.env` อิสระ 4 ไฟล์ — หนึ่งไฟล์ต่อแอป บวกกับไฟล์ root สำหรับ Docker:

```
template-nest-nuxt/
├── .env[.example]            ← อ่านโดย docker-compose.yml
├── apps/
│   ├── backend/
│   │   └── .env[.example]    ← NestJS อ่านตรง
│   ├── frontend/
│   │   └── .env[.example]    ← Nuxt อ่านตรง
│   └── docs/
│       └── .env[.example]    ← VitePress dev server (dotenv)
└── ...
```

แต่ละแอปอ่าน **เฉพาะ** `.env` ของตัวเองเท่านั้น ไม่รู้จักไฟล์ของแอปอื่น ส่วน `.env` ที่ root จำเป็นสำหรับ docker-compose

ใน repo จะมีแค่ไฟล์ `.env.example` — ส่วน `.env` จริงจะถูกสร้างขึ้นด้วยการคัดลอก ไม่ว่าจะทำมือผ่าน `pnpm env:copy` หรืออัตโนมัติตอนรัน `pnpm dev`/`pnpm docker:up` ครั้งแรก (ดู [`predev.mjs`, `predocker.mjs`](/th/guide/scripts#predev-mjs-predocker-mjs) ในคู่มือ [สคริปต์](/th/guide/scripts)) การคัดลอกปลอดภัยโดย default — จะไม่เขียนทับ `.env` ที่มีอยู่แล้ว ถ้าต้องการบังคับเขียนทับ `.env` ทั้งหมดด้วยค่าจาก `.env.example` ให้ใช้ `pnpm env:copy:force`

::: warning
`pnpm env:copy:force` จะเขียนทับไฟล์ `.env` **ทั้งหมด** ด้วยค่าจาก `.env.example` — รวมถึงการเปลี่ยนแปลงที่คุณทำเอง (พอร์ตของคุณเอง, secret ฯลฯ) ก็จะหายไปด้วย ใช้อย่างระมัดระวัง
:::

## พอร์ต 3 ชั้น

service เดียวกันสามารถมี **พอร์ตได้ถึง 3 แบบต่างกัน** ขึ้นอยู่กับบริบทการรัน — นี่ไม่ใช่การซ้ำซ้อนหรือพิมพ์ผิด แต่ละแบบมีหน้าที่ของตัวเอง:

| ชั้น            | ตัวแปร                                                                   | ไฟล์                                                         | ความหมาย                                                                   |
| ------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| Dev port      | `PORT`                                                                  | `apps/backend/.env`, `apps/frontend/.env`, `apps/docs/.env` | พอร์ตที่ process ฟังอยู่ตอนรัน `pnpm dev`                                         |
| Internal port | `BACKEND_INTERNAL_PORT`, `FRONTEND_INTERNAL_PORT`, `DOCS_INTERNAL_PORT` | `.env` (root)                                               | พอร์ตที่ process ฟังอยู่ **ภายใน container** ตอนใช้ Docker                        |
| Host port     | `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT`             | `.env` (root)                                               | พอร์ตที่มองเห็น service ได้จาก **นอก** Docker (`localhost:<host-port>` บนเครื่อง) |

ทำไมใช้ตัวแปรเดียวไม่ได้: `pnpm dev` กับ Docker เป็น process การรันที่ต่างกัน มี requirement ต่างกัน ใน Docker ตัว process ภายใน container กับ address ที่เครื่อง host เข้าถึงได้ เป็นตัวเลขสองตัวที่เชื่อมกันด้วยการ map พอร์ตแบบ NAT (`ports: "<host-port>:<internal-port>"`) ในขณะที่ `pnpm dev` เป็นแค่ process เดียวบนเครื่องเปล่าๆ ที่มีพอร์ตเดียว

### ทำไม `PORT` ไม่ได้อ่านจาก `apps/*/.env` ใน Docker

Internal port ของ container **ไม่ได้** อ่านตรงจาก `apps/backend/.env` (ที่มี `PORT` ของตัวเองอยู่แล้ว) แม้ว่า `env_file:` จะส่งไฟล์นั้นทั้งไฟล์เข้า container ก็ตาม เหตุผลคือเรื่องเวลา: `ports:` ใน `docker-compose.yml` (ที่กำหนดว่า Docker ควร proxy ไปที่ไหน) จะถูก Compose resolve ตอนอ่าน YAML ซึ่งเป็น **ก่อน** container start ในขณะที่ `env_file:` จะส่งตัวแปรเข้า container แค่ **ตอน** start เท่านั้น สองจุดนี้เป็นเวลาที่ต่างกัน — Compose ไม่สามารถเอาค่าจาก `apps/backend/.env` ไปแทนใน `ports:` ได้จริงๆ ทางเดียวที่จะทำให้ทั้งสองส่วน (`ports:` และค่าที่เข้าไปใน `PORT` ภายใน container จริงๆ) ตรงกันแน่นอน คือต้องเอามาจากแหล่งเดียวกันที่ Compose มองเห็นได้ตอน interpolation — นั่นคือ `.env` ที่ root ด้วยเหตุนี้ `environment: PORT: '${BACKEND_INTERNAL_PORT}'` ใน `docker-compose.yml` จึง override ค่าที่ปกติจะมาจาก `apps/backend/.env` ผ่าน `env_file:` อย่างชัดเจน (`environment:` ใน Compose ชนะ `env_file:` เสมอ)

ผลที่ตามมาในทางปฏิบัติ: ถ้าเปลี่ยน `PORT` ใน `apps/backend/.env` จะไม่มีอะไรพังสำหรับ `pnpm dev` แต่ก็ไม่มีผลอะไรกับ Docker เช่นกัน — `environment:` จะชนะด้วยค่าจาก `BACKEND_INTERNAL_PORT` เสมอ ถ้าจะเปลี่ยนพอร์ตสำหรับ Docker จริงๆ ต้องเปลี่ยน `BACKEND_INTERNAL_PORT`/`FRONTEND_INTERNAL_PORT`/`DOCS_INTERNAL_PORT` ใน `.env` ที่ root

`docs` มีจุดที่ต่างออกไปอีกนิด: ภายใน container รัน `nginx` ซึ่งไม่อ่าน environment variable เองโดยตรง — `PORT` จะเข้าไปอยู่ใน config ผ่าน `envsubst` ที่แปลง `apps/docs/nginx.conf.template` (`listen ${PORT};`) เป็น `nginx.conf` จริงตอน container start

รายละเอียดเพิ่มเติม พร้อมตัวอย่าง `docker-compose.yml` — ดู [Docker → Host port, internal port และทำไมต้องมีสองแบบ](/th/guide/docker#host-port-internal-port-และทําไมต้องมีสองแบบ)

## ตัวแปรแยกตามไฟล์

### `.env` (root)

| ตัวแปร                    | ค่า     | คอมเมนต์                                                     |
| ------------------------ | ------ | ----------------------------------------------------------- |
| `BACKEND_HOST_PORT`      | `3500` | Host port ของ backend — พอร์ตที่มองเห็น service ได้จากนอก Docker |
| `FRONTEND_HOST_PORT`     | `3600` | Host port ของ frontend                                      |
| `DOCS_HOST_PORT`         | `3700` | Host port ของ docs                                          |
| `BACKEND_INTERNAL_PORT`  | `3100` | พอร์ตที่ backend ฟังอยู่ **ภายใน container**                      |
| `FRONTEND_INTERNAL_PORT` | `3200` | พอร์ตที่ frontend ฟังอยู่ภายใน container                          |
| `DOCS_INTERNAL_PORT`     | `3300` | พอร์ตที่ nginx (docs) ฟังอยู่ภายใน container                      |

### `apps/backend/.env`

| ตัวแปร                     | ค่า (dev)           | คอมเมนต์                                                                                                                                                                                                                        |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`                | `development`      | ควบคุม (นอกเหนือจากอย่างอื่น) การเปิดใช้งาน Swagger UI (`/api/docs` — เฉพาะตอนไม่ใช่ `production`) ใน Docker จะเป็น `production` เสมอ — กำหนดใน `apps/backend/Dockerfile` (`ENV NODE_ENV=production`) ไม่ใช่ผ่าน `.env`/`docker-compose.yml` |
| `PORT`                    | `3100`             | พอร์ต backend ตอน `pnpm dev` ใน Docker จะถูก override ด้วย `BACKEND_INTERNAL_PORT` จาก `.env` ที่ root                                                                                                                              |
| `CORS_ORIGIN_SCHEME_HOST` | `http://localhost` | Origin ที่อนุญาตสำหรับ CORS — scheme+host ไม่เปลี่ยนใน Docker                                                                                                                                                                          |
| `CORS_ORIGIN_PORT`        | `3200`             | Origin ที่อนุญาตสำหรับ CORS — พอร์ตของ frontend ใน Docker จะถูก override ด้วย `FRONTEND_HOST_PORT`                                                                                                                                     |

### `apps/frontend/.env`

| ตัวแปร                      | ค่า (dev)                | คอมเมนต์                                                                                                                                                                                |
| -------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                     | `3200`                  | พอร์ต frontend ตอน `pnpm dev` ใน Docker จะถูก override ด้วย `FRONTEND_INTERNAL_PORT` จาก `.env` ที่ root                                                                                    |
| `NUXT_PUBLIC_API_BASE`     | `/api/backend`          | Prefix สำหรับ server-side proxy ไปที่ backend (browser เรียกมาที่นี่ ไม่ได้เรียก backend ตรง)                                                                                                      |
| `NUXT_BACKEND_URL`         | `http://localhost:3100` | Address ของ backend สำหรับ Nuxt SSR (ฝั่ง server) ใน Docker จะถูก override เป็น `http://backend:${BACKEND_INTERNAL_PORT}` — เรียกด้วยชื่อ service เพราะ `localhost` ภายใน Docker network เข้าไม่ถึง |
| `NUXT_PUBLIC_BACKEND_PORT` | `3100`                  | พอร์ตของ backend เฉยๆ สำหรับลิงก์ใน DevPanel (ไม่ได้ใช้เรียก request) ใน Docker จะถูก override ด้วย `BACKEND_HOST_PORT`                                                                           |
| `NUXT_PUBLIC_APP_ENV`      | `development`           | โหมด environment ฝั่ง client (เช่น การแสดงลิงก์ Swagger ใน DevPanel) ใน Docker จะถูกกำหนดตายตัวเป็น `production` — กำหนดใน `docker-compose.yml`                                                  |
| `NUXT_PUBLIC_DOCS_URL`     | `http://localhost:5173` | ลิงก์ไปยังเอกสาร VitePress (เมนู, DevPanel) ใน Docker จะถูก override เป็น `http://localhost:${DOCS_HOST_PORT}`                                                                               |

### `apps/docs/.env`

| ตัวแปร  | ค่า     | คอมเมนต์                                                                                                                |
| ------ | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `PORT` | `5173` | พอร์ตของ VitePress dev server อ่านผ่าน `dotenv` ใน `.vitepress/config.ts` — VitePress เองไม่โหลด `.env` ให้ ไม่ได้ใช้ใน Docker |
