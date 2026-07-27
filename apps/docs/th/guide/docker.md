# Docker

ในโปรเจกต์มี `Dockerfile` อิสระ 3 ไฟล์ (`backend`, `frontend`, `docs`) และ `docker-compose.yml` หนึ่งไฟล์ที่รวมทั้งสามตัวขึ้นมาเป็น stack เดียว

`Dockerfile` แต่ละไฟล์เป็นแบบ multi-stage: stage `builder` ติดตั้ง dependencies และ build production artifact ส่วน stage `runner` คือ image สุดท้ายที่เบา ไม่มี source หรือ dev dependencies

## apps/backend

Build NestJS เป็น `dist/` แล้ว deploy ผ่าน `pnpm deploy --prod` — image สุดท้ายมีแค่ `node_modules` แบบ production กับโค้ดที่ build แล้วเท่านั้น ไม่มี `pnpm`/source

รันคำสั่งต่อไปนี้ทั้งหมด **จาก root ของ monorepo** (ไม่ต้อง cd เข้าไปใน /apps/backend)

Build image

```bash
docker build -f apps/backend/Dockerfile -t backend-preview .
```

รัน container ที่พอร์ต 3100

```bash
docker run -d -p 3100:3100 \
  -e PORT=3100 \
  -e CORS_ORIGIN_SCHEME_HOST=http://localhost \
  -e CORS_ORIGIN_PORT=3200 \
  --name backend-preview backend-preview
```

ตรวจสอบ:

```bash
curl http://localhost:3100/health
```

หยุดและลบ:

```bash
docker stop backend-preview
docker rm backend-preview
docker rmi backend-preview
```

## apps/frontend

Build Nuxt เป็น `.output/` (Nitro standalone server — มีทุกอย่างที่จำเป็นสำหรับรันอยู่แล้ว ไม่ต้องคัดลอก `node_modules` แยก)

รันคำสั่งต่อไปนี้ทั้งหมด **จาก root ของ monorepo** (ไม่ต้อง cd เข้าไปใน /apps/frontend)

Build image

```bash
docker build -f apps/frontend/Dockerfile -t frontend-preview .
```

รัน container ที่พอร์ต 3200

```bash
docker run -d -p 3200:3200 \
  -e PORT=3200 \
  -e NUXT_PUBLIC_API_BASE=/api/backend \
  -e NUXT_PUBLIC_BACKEND_PORT=3100 \
  -e BACKEND_URL=http://localhost:3100 \
  --name frontend-preview frontend-preview
```

ตรวจสอบ:

```bash
curl http://localhost:3200/api/health
```

หรือเปิด: [http://localhost:3200](http://localhost:3200)

::: warning
รันแบบนี้แยกจาก `backend` frontend จะ proxy request ไปที่ API ไม่ได้ ถ้า container ของ backend ไม่ได้เปิดอยู่หรือเข้าถึงผ่าน `BACKEND_URL` ไม่ได้ ถ้าต้องการทดสอบทั้งคู่พร้อมกันจริงๆ ให้เปิดผ่าน [docker compose](#docker-compose) หรือใช้ Docker network เดียวกันทั้งสอง container
:::

หยุดและลบ:

```bash
docker stop frontend-preview
docker rm frontend-preview
docker rmi frontend-preview
```

## apps/docs

Static ของ VitePress เสิร์ฟผ่าน `nginx`

พอร์ตภายใน container กำหนดผ่านตัวแปร **`PORT`** (ค่า default `5173` ดูที่ `apps/docs/.env.example`) — วิธีเดียวกับ `backend`/`frontend` แต่กลไกภายในต่างกัน: `nginx` เองไม่อ่าน environment variable `apps/docs/nginx.conf.template` ไม่ใช่ config ที่พร้อมใช้ แต่เป็น template ที่มี `listen ${PORT};` — entrypoint script ที่มากับ image `nginx:alpine` จะหา `*.template` ใน `/etc/nginx/templates/` เอง แล้วรันผ่าน `envsubst` เอาผลลัพธ์ไปวางที่ `/etc/nginx/conf.d/` — ก่อนที่ `nginx` เองจะ start

รันคำสั่งต่อไปนี้ทั้งหมด **จาก root ของ monorepo** (ไม่ต้อง cd เข้าไปใน /apps/docs)

Build image

```bash
docker build -f apps/docs/Dockerfile -t docs-preview .
```

รัน container ที่พอร์ต 5173

```bash
docker run -d -p 5173:5173 -e PORT=5173 --name docs-preview docs-preview
```

ตรวจสอบ: [http://localhost:5173](http://localhost:5173)

หยุดและลบ:

```bash
docker stop docs-preview
docker rm docs-preview
docker rmi docs-preview
```

## docker compose

`docker-compose.yml` เปิด `backend`, `frontend` และ `docs` พร้อมกัน อยู่ใน network เดียวกัน

### `env_file` และ override

`backend`, `frontend` และ `docs` เชื่อม `apps/*/.env` ของตัวเองผ่าน `env_file:` — ไฟล์เดียวกับที่ `pnpm dev` ใช้

```yaml
backend:
  env_file: apps/backend/.env
```

ไฟล์ `.env` จำเป็นต้องมี — ถ้าไม่มี `docker compose up` จะปฏิเสธไม่ start (`env file ... not found`)

บางครั้งค่าต้อง **ต่างกัน** สำหรับ Docker — เช่น `BACKEND_URL`: ใน `apps/frontend/.env` เป็น `http://localhost:3100` (ถูกต้องสำหรับ `pnpm dev` ที่ทุกอย่างอยู่บน host) แต่ภายใน Docker network `localhost` สำหรับ container ของ frontend หมายถึงตัว container เอง ไม่ใช่ backend สำหรับกรณีแบบนี้ `environment:` ใน `docker-compose.yml` จะ **override ค่าจากไฟล์อย่างชัดเจน** — `environment:` สำคัญกว่า `env_file:` เสมอ:

```yaml
frontend:
  env_file: apps/frontend/.env
  environment:
    BACKEND_URL: http://backend:3100   # override localhost:3100 จาก .env
```

รายละเอียดเพิ่มเติมว่าตัวแปรไหนตรงกัน ตัวแปรไหนถูก override — ดู [ตัวแปรสภาพแวดล้อม (ENV)](/th/guide/env-variables)

### Host port, internal port และทำไมต้องมีสองแบบ

ในแต่ละ service มีพอร์ตอิสระสองแบบ และการสับสนระหว่างสองแบบนี้เป็นสาเหตุที่พบบ่อยของอาการ "container ขึ้นแล้วแต่ไม่ตอบสนอง":

| อะไร                          | ตัวแปร                                  | อยู่ที่ไหน      | ใครอ่าน |
| ----------------------------- | -------------------------------------------- | -------------- | ---------- |
| Host port (นอก Docker)    | `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `DOCS_HOST_PORT` | `.env` (root) | เฉพาะ `docker-compose.yml` ฝั่งซ้ายของ `ports:` |
| Internal port (พอร์ตที่ process ฟังอยู่) | `BACKEND_INTERNAL_PORT`, `FRONTEND_INTERNAL_PORT`, `DOCS_INTERNAL_PORT` | `.env` (root) | `docker-compose.yml` — สองที่พร้อมกัน: ฝั่งขวาของ `ports:` **และ** `environment: PORT` |

ทำไม internal port ไม่ได้อ่านตรงจาก `apps/backend/.env` (ที่มี `PORT` อยู่แล้ว) แต่อ่านจากตัวแปรแยกใน `.env` ที่ root: `ports:` จะถูก Compose resolve **ตอนอ่าน YAML** ก่อน container start ในขณะที่ `env_file:` จะส่งเนื้อหาไฟล์เข้า container แค่ **ตอน** start เท่านั้น สองจุดนี้เป็นเวลาที่ต่างกัน — Compose ไม่สามารถแทนค่าจาก `apps/backend/.env` ลงใน `ports:` ได้จริงๆ ทางเดียวที่จะรับประกันว่าทั้งสองส่วน (`ports:` กับค่าที่เข้าไปใน `PORT` จริงๆ) ตรงกัน คือต้องเอามาจากแหล่งเดียวกันที่ Compose มองเห็นได้ตอน interpolation ด้วยเหตุนี้ `environment: PORT` ใน `docker-compose.yml` จึง override `PORT` ที่ปกติจะมาจาก `apps/*/.env` ผ่าน `env_file:` อย่างชัดเจน

```yaml
backend:
  ports:
    - '${BACKEND_HOST_PORT}:${BACKEND_INTERNAL_PORT}'
  env_file: apps/backend/.env
  environment:
    PORT: '${BACKEND_INTERNAL_PORT}'   # override PORT จาก .env
```

ถ้าเปลี่ยนแค่ `PORT` ใน `apps/backend/.env` โดยไม่แตะ `BACKEND_INTERNAL_PORT` ใน `.env` ที่ root — จะไม่มีอะไรพัง: `environment:` จะชนะด้วยค่าจาก `BACKEND_INTERNAL_PORT` เสมอ ไม่ใช่ค่าในไฟล์ ถ้าต้องการเปลี่ยนพอร์ตที่ container ฟังอยู่จริงๆ ต้องเปลี่ยน `BACKEND_INTERNAL_PORT`/`FRONTEND_INTERNAL_PORT`/`DOCS_INTERNAL_PORT` ใน `.env` ที่ root — ตัวแปรเหล่านี้จะเข้าไปอยู่ใน `PORT` ภายใน container พร้อมกับกำหนดว่า Docker จะ proxy host port ไปที่ไหนด้วย

สำหรับ `docs` ก็ทำงานแบบเดียวกัน แต่ `nginx` เองไม่อ่าน `PORT` — ดู [envsubst และ nginx.conf.template](#apps-docs) ด้านบน

### ไฟล์ .env ทุกไฟล์จำเป็นต้องมี

ถ้าไม่มี `.env` ที่ root `docker compose up` จะปฏิเสธไม่ start — เพราะไม่มีตัวแปรพอร์ต Compose จึง resolve `ports:` ไม่ได้ (`no port specified`) ถ้าไม่มี `apps/backend/.env`/`apps/frontend/.env`/`apps/docs/.env` — ก็จะปฏิเสธเช่นกัน ด้วย error `env file ... not found` (`env_file:`) ทั้งสองกรณีไม่มีการเติมค่า default แบบเงียบๆ ให้ — นี่คือการตัดสินใจตั้งใจ ไม่ใช่ default ที่ลืมใส่

สร้าง `.env` ที่ขาดหายทั้งหมดด้วยคำสั่งเดียว โดยไม่แตะพอร์ตหรือรัน Docker เอง:

```bash
pnpm env:copy
```

### รันผ่าน `pnpm docker:up`

```bash
pnpm docker:up
```

ไม่ใช่แค่ alias ของ `docker compose up` — ก่อน start จะรัน `scripts/predocker.mjs` อัตโนมัติก่อน (ผ่าน npm `pre*` convention เหมือนกับ [`predev.mjs`](/th/guide/scripts#predev-mjs-predocker-mjs) ที่ใช้กับ `pnpm dev`):

1. คัดลอก `.env` ที่ขาดหายจาก `.env.example` — root, `apps/backend`, `apps/frontend`, `apps/docs` (ใช้ `copyEnvFiles()` ตัวเดียวกับ `pnpm env:copy`)
2. ตรวจสอบว่า `BACKEND_HOST_PORT`/`FRONTEND_HOST_PORT`/`DOCS_HOST_PORT` ถูกใช้อยู่แล้วบน host หรือไม่ — ถ้าชนกันจะมี dialog ให้เลือก: kill process ที่ครองพอร์ตอยู่ หรือยกเลิกการรัน

`docker compose up` ตรงๆ (ไม่ผ่าน `pnpm docker:up`) โดยไม่มี `.env` ที่จำเป็น จะ fail — คำสั่งนี้ไม่สร้าง `.env` หรือตรวจสอบพอร์ตที่ถูกใช้เองแต่อย่างใด ถ้าสร้างไฟล์ `.env` ไว้แล้ว (เช่นผ่าน `pnpm env:copy`) แต่หลังจากนั้นมีอะไรมาใช้พอร์ตแทน — `docker compose up` จะไม่เตือน แค่ปฏิเสธไม่ start service นั้นด้วย Docker error ธรรมดา `address already in use`

Host port (`3500`/`3600`/`3700`) ใน `.env.example` ตั้งใจไม่ใช้ `3000`/`3001` — เพราะเป็นค่า default ที่พบบ่อยที่สุดของ Node framework หลายตัว (Next.js, Create React App, ตัว Nuxt เองตอน dev) การชนกับโปรเจกต์อื่นที่รันอยู่แล้วบนพอร์ตเดียวกันแทบจะแน่นอนถ้าไม่เลี่ยง ถ้า host port ยังถูกใช้อยู่โดยอะไรอื่น (ที่ไม่ใช่สิ่งที่ `predocker.mjs` เสนอให้ kill) — ให้แก้แค่ `.env` ไม่ใช่ `docker-compose.yml` เช่น:

```bash
# ใน .env:
BACKEND_HOST_PORT=4500
```

::: tip
`NUXT_PUBLIC_BACKEND_PORT` (ใช้แค่สำหรับลิงก์ backend ใน DevPanel ไม่ได้ใช้เรียก request) จะถูก override ใน `docker-compose.yml` ด้วยค่า `${BACKEND_HOST_PORT}` — ตอนเปลี่ยน host port ของ backend ไม่ต้องอัปเดตตัวแปรนี้เองด้วยมือ เพราะผูกกับแหล่งเดียวกันอยู่แล้ว
:::

### Network — dependency ที่ต้องเตรียมก่อน

Network `template-nest-nuxt_app` ถูกประกาศเป็น `external: true` — `docker compose` **ไม่สร้าง** network ให้เอง คาดหวังว่ามีอยู่แล้ว ถ้ายังไม่มี network:

```bash
docker network create template-nest-nuxt_app
```

ถ้าข้ามขั้นตอนนี้ `docker compose up` จะ fail ด้วย error `network ... declared as external, but could not be found`

### เริ่มรัน

รันคำสั่งต่อไปนี้ทั้งหมด **จาก root ของ monorepo**

```bash
docker compose up --build
```

- Backend: `http://localhost:3500` (หรือ `BACKEND_HOST_PORT`)
- Frontend: `http://localhost:3600` (หรือ `FRONTEND_HOST_PORT`)
- Docs: `http://localhost:3700` (หรือ `DOCS_HOST_PORT`)

### หยุด

```bash
docker compose down
```

Network `template-nest-nuxt_app` จะไม่ถูกลบ (เพราะเป็น `external` compose ไม่ได้สร้างเอง จึงไม่ใช่หน้าที่ compose ที่จะลบ) ลบเองด้วยมือถ้าไม่ต้องการแล้ว:

```bash
docker network rm template-nest-nuxt_app
```

## เพิ่มเติม: unprivileged user

Runner stage ของ `backend` และ `frontend` รันด้วย `USER node` — unprivileged user ที่มีอยู่แล้วใน image `node:*-alpine` ไม่ต้องสร้างเอง:

```dockerfile
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder --chown=node:node /deploy/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/backend/dist ./dist
```

ทำไมต้องทำแบบนี้: ถ้าไม่ทำ process ภายใน container จะรันด้วย `root` ถ้าแอปมี RCE (remote code execution) attacker จะได้ root ใน container ทันที — ทำให้ blast radius กว้างขึ้นไปอีก (container escape, mounted volume ฯลฯ จะ exploit ง่ายขึ้น) `USER node` ลดความเสี่ยงนี้โดยไม่มีค่าใช้จ่ายใดๆ — image ไม่เสีย functionality อะไรไปเลย

`--chown=node:node` ใน `COPY` จำเป็นต้องมี: `WORKDIR /app` ถูกสร้างขึ้นตอนยังเป็น `root` **ก่อน** `USER node` ถ้าคัดลอกไฟล์โดยไม่มี `--chown` process ที่รันด้วย `node` จะอ่าน/รันไฟล์เหล่านั้นไม่ได้

สำหรับ `docs` (`nginx:alpine`) ไม่ต้องมี `USER` แยก — image รัน worker process ด้วย unprivileged user ชื่อ `nginx` เป็น default อยู่แล้ว

## เพิ่มเติม: HEALTHCHECK

`Dockerfile` ทั้งสามไฟล์มี `HEALTHCHECK` — ถ้าไม่มี Docker/orchestrator (Kubernetes readiness probe, Docker Swarm, `docker-compose` ที่ใช้ `depends_on: condition: service_healthy`) จะแยกไม่ออกระหว่าง "process รันอยู่" กับ "แอปตอบสนอง request จริงๆ"

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1
```

| Service   | Path ที่ตรวจสอบ        |
| -------- | ------------------------ |
| backend  | `http://127.0.0.1:${PORT}/health` |
| frontend | `http://127.0.0.1:${PORT}/api/health` |
| docs     | `http://127.0.0.1:${PORT}/` |

`${PORT}` ใน `HEALTHCHECK CMD` ไม่ใช่การแทนค่าตอน build — แต่เป็น shell variable ธรรมดา อ่านจากค่า `PORT` จริงภายใน container ตอนที่ตรวจสอบ (ค่าเดียวกับที่กำหนดผ่าน `environment:` ใน `docker-compose.yml`)

เลือกใช้ `wget` เพราะมีอยู่แล้วใน base image (`node:*-alpine`, `nginx:alpine`) โดยไม่ต้องติดตั้ง `curl` เพิ่ม

::: tip
การใช้ `127.0.0.1` แทน `localhost` อย่างชัดเจน ไม่ใช่แค่เรื่อง style `/etc/hosts` ภายใน container resolve `localhost` ไปได้ทั้งสอง address คือ `127.0.0.1` และ `::1` และ `wget` อาจลองไปที่ `::1` ก่อน ถ้า service ฟังอยู่แค่ IPv4 (พฤติกรรม default ทั่วไปของ nginx/Node) การลองแบบนั้นจะได้ `Connection refused` และ healthcheck จะกลายเป็น `unhealthy` ทั้งที่ service ยังทำงานปกติและตอบสนองผ่าน IPv4 ได้ ทดสอบจริงตอนเขียนส่วนนี้ — ตอนใช้ `localhost` container `docs` จะกลายเป็น `unhealthy` พอเปลี่ยนเป็น `127.0.0.1` จะเป็น `healthy` เสถียร
:::

ตรวจสอบสถานะของ container ที่รันอยู่:

```bash
docker inspect --format='{{json .State.Health}}' backend-preview
```

## Docker: ขั้นตอนการ build

ทั้งสาม service (`backend`, `frontend`, `docs`) build ผ่านสองขั้นตอน:

- [ builder ]
  - COPY package.json manifest
  - pnpm install --frozen-lockfile
  - COPY source
  - Build โปรเจกต์

- [ runner ]
  - Image สุดท้าย
  - มีแค่สิ่งที่จำเป็นสำหรับรัน

Backend เพิ่มเติมด้วยการรัน `pnpm deploy --prod /deploy`
— คัดลอกจาก node_modules เฉพาะ dependency ของ @repo/backend
ไม่มี package อื่นของ monorepo ปนมา runner จะได้ node_modules แบบแบนที่สะอาด

Frontend ไม่ทำแบบนี้ — Nuxt จัดการ pack dependency ทั้งหมดเองอยู่แล้ว
ใน `.output` ตอน build ไม่ต้องมี node_modules ใน runner เลย

Docs build VitePress เป็น static (`.vitepress/dist`)
runner เป็นแค่ nginx ที่เสิร์ฟ static นั้น ไม่มีทั้ง node_modules
และ pnpm ใน image สุดท้ายเลย

ทำไม `install` ต้องมาก่อน `COPY` source?
Docker cache เป็นชั้นๆ — ถ้า source เปลี่ยนแต่ package.json ไม่เปลี่ยน
`install` จะถูกดึงมาจาก cache
ลำดับ: `COPY` manifest → `pnpm install` → `COPY . .`

**Backend builder:**

1. `pnpm install --frozen-lockfile` — ติดตั้ง dependency ทั้งหมดของ monorepo `--frozen-lockfile` รับประกันว่าเวอร์ชันตรงกับตอน develop ในเครื่อง
2. `pnpm build @repo/shared` — compile shared เป็น ESM (dist/) ต้องทำก่อน nest build เพราะ backend import จาก dist/
3. `nest build` — compile backend เป็น dist/
4. `pnpm deploy --prod /deploy` — คัดลอกเฉพาะ dependency ที่จำเป็นไปที่ /deploy ไม่ได้ดาวน์โหลดใหม่ — ดึงจาก node_modules

**Backend runner:**

```
/app/
├── node_modules/     ← มีแค่ dependency ของ @repo/backend (pnpm deploy)
│                       โครงสร้างแบน ไม่มี package อื่นของ monorepo
└── dist/
    └── main.js       ← โค้ดที่ compile แล้ว (rootDir: ./src → path สะอาด)

CMD: node dist/main
```

**Frontend runner:**

```
/app/
└── .output/                      ← Nuxt pack ทุกอย่างมาไว้ที่นี่ตอน build
    ├── server/
    │   └── index.mjs             ← entry point (Node.js server)
    └── public/                   ← static (JS, CSS, assets)

CMD: node .output/server/index.mjs

ไม่ต้องมี node_modules — dependency ทั้งหมดอยู่ใน .output แล้ว
คัดลอก .output ไปที่ server แล้วรันได้เลยโดยไม่ต้องใช้ pnpm
```
