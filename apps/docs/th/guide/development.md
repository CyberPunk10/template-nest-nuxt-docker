# การพัฒนา

โปรเจกต์นี้มี **โหมดการรันสองโหมดที่เป็นอิสระต่อกัน** ทั้งสองโหมดไม่เหมือนกันและแก้ปัญหาคนละแบบ — สำคัญมากที่จะต้องไม่สับสน

## ข้อกำหนด

- **Node.js ≥ 24** และ **pnpm ≥ 11** (ดู `engines` ใน `package.json` ที่ root)
- ที่ root ของ repository มี [`.nvmrc`](https://github.com/nvm-sh/nvm#nvmrc) กำหนดเวอร์ชันไว้ที่ `24` — หากติดตั้ง nvm/fnm/asdf ไว้แล้ว ให้รัน `nvm use` (หรือเปิด auto-switch) เพื่อไม่ต้องจำเวอร์ชันเอง
- `.npmrc` ตั้งค่า `engine-strict=true` — `pnpm install` จะ **ปฏิเสธ** การติดตั้ง dependency บนเวอร์ชัน Node ที่ไม่ตรงกัน แทนที่จะติดตั้งเงียบ ๆ แล้วอาจพังตอน runtime ภายหลัง
- เวอร์ชันของ pnpm ถูกกำหนดผ่าน `packageManager` ใน `package.json` — เมื่อเปิดใช้ [corepack](https://nodejs.org/api/corepack.html) จะถูกดึงมาใช้อัตโนมัติ ไม่ต้องติดตั้งเอง

|                             | โหมดพัฒนา                         | โหมด production                    |
| --------------------------- | -------------------------------- | ---------------------------------- |
| คำสั่ง                         | `pnpm dev`                       | `docker compose up`                |
| โค้ด (backend/frontend/docs) | รันแบบ native พร้อม HMR            | build เป็น Docker image             |
| ฐานข้อมูล                     | PostgreSQL ใน Docker             | PostgreSQL ใน Docker               |
| การเข้าถึง                    | ตรง ๆ: `:3000`, `:3001`, `:5173` | ตรง ๆ: host port จาก `.env` ที่ root |
| ความเร็วในการแก้ไข            | ทันที (hot reload)                 | build image ใหม่                    |

## ทำไมสำหรับการพัฒนาถึง — ไม่ใช้ Docker

Docker image จะ build **artifact สำหรับ production** (`pnpm build`) การเปลี่ยนแปลงโค้ดใด ๆ จะต้อง build image ใหม่ — นั่นคือหลายสิบวินาทีต่อการแก้ไขหนึ่งครั้ง โดยไม่มี hot-reload และไม่สะดวกในการ debug

ดังนั้นในโหมด dev โค้ดจึงรันแบบ **native** ผ่าน `pnpm dev` ส่วน Docker จะรันเฉพาะสิ่งที่ติดตั้งแบบ native ไม่สะดวก — นั่นคือ **ฐานข้อมูล**

การแบ่งแยกแบบนี้เป็นแนวปฏิบัติมาตรฐาน: บนเครื่อง local รันโค้ดแบบ native เพื่อความเร็ว ส่วน Docker จะ build เฉพาะสำหรับ image ของ prod และการ deploy เท่านั้น

## โหมดพัฒนา

```bash
pnpm dev
```

คำสั่งเดียวรันทุกอย่างที่จำเป็น ก่อนเริ่ม [`predev.mjs`](/th/guide/env-variables#predev-mjs) จะทำงาน:

1. สร้าง `.env` จาก `.env.example` หากยังไม่มี;
2. จัดการความขัดแย้งของ port;
3. **รัน PostgreSQL** (`docker-compose.dev.yml`) หาก container ยังไม่ได้ทำงาน

จากนั้น `dev.mjs` จะรันสามกระบวนการแบบ native โดยแต่ละตัวมี hot-reload ของตัวเอง:

| Service  | URL                     | เทคโนโลยี         |
| -------- | ----------------------- | ---------------- |
| Backend  | `http://localhost:3001` | NestJS `--watch` |
| Frontend | `http://localhost:3000` | Nuxt dev         |
| Docs     | `http://localhost:5173` | VitePress dev    |

ฐานข้อมูลจะรันครั้งเดียวและอยู่กับ persistent volume (`postgres_data`) — ข้อมูลไม่หายระหว่างการรันแต่ละครั้ง ไม่จำเป็นต้องหยุดมันระหว่าง session

การรัน/หยุดฐานข้อมูลด้วยตนเอง (โดยทั่วไปไม่จำเป็น — `predev` ทำให้แล้ว):

```bash
docker compose -f docker-compose.dev.yml up -d   # รัน
docker compose -f docker-compose.dev.yml down     # หยุด (ข้อมูลถูกเก็บไว้ใน volume)
```

## โหมด production

```bash
docker compose up --build
```

Build และรันสแตกทั้งหมด — **backend**, **frontend**, **docs** — เป็น container อิสระสามตัว แต่ละตัวมี host port ของตัวเอง (`BACKEND_HOST_PORT`/`FRONTEND_HOST_PORT`/`DOCS_HOST_PORT` จาก `.env` ที่ root)
