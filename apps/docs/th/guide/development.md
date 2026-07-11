# การพัฒนา

โปรเจกต์นี้มี **โหมดการรันสองโหมดที่เป็นอิสระต่อกัน** ทั้งสองโหมดไม่เหมือนกันและแก้ปัญหาคนละแบบ — สำคัญมากที่จะต้องไม่สับสน

## ข้อกำหนด

- **Node.js ≥ 24** และ **pnpm ≥ 11** (ดู `engines` ใน `package.json` ที่ root)
- ที่ root ของ repository มี [`.nvmrc`](https://github.com/nvm-sh/nvm#nvmrc) กำหนดเวอร์ชันไว้ที่ `24` — หากติดตั้ง nvm/fnm/asdf ไว้แล้ว ให้รัน `nvm use` (หรือเปิด auto-switch) เพื่อไม่ต้องจำเวอร์ชันเอง
- `.npmrc` ตั้งค่า `engine-strict=true` — `pnpm install` จะ **ปฏิเสธ** การติดตั้ง dependency บนเวอร์ชัน Node ที่ไม่ตรงกัน แทนที่จะติดตั้งเงียบ ๆ แล้วอาจพังตอน runtime ภายหลัง
- เวอร์ชันของ pnpm ถูกกำหนดผ่าน `packageManager` ใน `package.json` — เมื่อเปิดใช้ [corepack](https://nodejs.org/api/corepack.html) จะถูกดึงมาใช้อัตโนมัติ ไม่ต้องติดตั้งเอง

|                              | โหมดพัฒนา                        | โหมด production                 |
| ---------------------------- | -------------------------------- | ------------------------------- |
| คำสั่ง                       | `pnpm dev`                       | `docker compose up`             |
| โค้ด (backend/frontend/docs) | รันแบบ native พร้อม HMR          | build เป็น Docker image         |
| ฐานข้อมูล                    | PostgreSQL ใน Docker             | PostgreSQL ใน Docker            |
| Reverse-proxy (Caddy)        | **ไม่ใช้งาน**                    | จุดเข้าเดียว (80/443)           |
| การเข้าถึง                   | ตรง ๆ: `:3000`, `:3001`, `:5173` | ทุกอย่างผ่าน Caddy บนโดเมนเดียว |
| ความเร็วในการแก้ไข           | ทันที (hot reload)               | build image ใหม่                |

## ทำไมสำหรับการพัฒนาถึง — ไม่ใช้ Docker

Docker image จะ build **artifact สำหรับ production** (`pnpm build`) การเปลี่ยนแปลงโค้ดใด ๆ จะต้อง build image ใหม่ — นั่นคือหลายสิบวินาทีต่อการแก้ไขหนึ่งครั้ง โดยไม่มี hot-reload และไม่สะดวกในการ debug

ดังนั้นในโหมด dev โค้ดจึงรันแบบ **native** ผ่าน `pnpm dev` ส่วน Docker จะรันเฉพาะสิ่งที่ติดตั้งแบบ native ไม่สะดวก — นั่นคือ **ฐานข้อมูล** ส่วน reverse-proxy (Caddy) ไม่จำเป็นในโหมด dev: คุณเข้าถึง service ต่าง ๆ ได้ตรง ๆ ผ่าน port ของแต่ละตัว

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

| Service  | URL                     | เทคโนโลยี        |
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

Build และรันสแตกทั้งหมดหลัง reverse-proxy Caddy:

- **Caddy** — จุดเข้าออกภายนอกเพียงจุดเดียว (port 80/443)
  - `/docs` และ `/docs/*` → container ของเอกสาร (static ของ VitePress);
  - อย่างอื่นทั้งหมด → frontend (Nuxt SSR) รวมถึง BFF-route `/api/backend/*` ซึ่งจะ forward ต่อไปยัง NestJS ผ่านเครือข่ายภายในเอง
- **backend**, **frontend**, **docs** ไม่ถูก publish ออกภายนอก — เข้าถึงได้เฉพาะผ่าน Caddy เท่านั้น

ที่อยู่และ HTTPS กำหนดผ่านตัวแปร `SITE_ADDRESS`:

- ค่าเริ่มต้น `:80` — HTTP ธรรมดา (ตรวจสอบ prod-build บนเครื่อง local);
- โดเมนจริง (`example.com`) — Caddy จะออก TLS-certificate ให้อัตโนมัติ (ACME/Let's Encrypt)

สำหรับ auto-HTTPS ต้องมี: โดเมนที่ชี้มายัง server, port 80/443 ที่เปิดอยู่ และ DNS ที่ propagate เรียบร้อยแล้ว **ก่อน** เริ่มรัน

สำหรับรายละเอียดการตั้งค่า reverse-proxy — ดู [Caddy](/th/guide/caddy)
