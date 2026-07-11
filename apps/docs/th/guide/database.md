# ฐานข้อมูล: PostgreSQL + Prisma

## Stack

- **PostgreSQL 17** — รันผ่าน Docker ในโหมด dev
- **Prisma 7** — ORM, migrations, การสร้าง client

---

## การรันในเครื่อง

เปิด PostgreSQL ผ่าน Docker:

```bash
docker compose -f docker-compose.dev.yml up -d
```

รัน migrations และสร้าง client:

```bash
cd apps/backend
pnpm prisma migrate dev
```

---

## การตั้งค่า

### `apps/backend/.env`

พารามิเตอร์การเชื่อมต่อฐานข้อมูลสำหรับ Prisma และแอป:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=template
```

### `.env` ที่ root

พารามิเตอร์สำหรับ Docker Compose:

```
POSTGRES_PORT=5432
```

### การเปลี่ยนพอร์ต

ถ้าพอร์ต 5432 ถูกใช้งานอยู่ ต้องเปลี่ยนใน **สองที่**:

1. `apps/backend/.env` — `POSTGRES_PORT=5435`
2. `.env` ที่ root — `POSTGRES_PORT=5435`

ไฟล์แรกถูกอ่านโดย Prisma ไฟล์ที่สองถูกอ่านโดย Docker Compose ตอน proxy พอร์ตจาก host เข้า container

---

## Prisma

### โครงสร้าง

```
apps/backend/
├── prisma/
│   ├── schema.prisma       ← models
│   └── migrations/         ← ประวัติ migration (commit เข้า git)
└── prisma.config.ts        ← การตั้งค่า Prisma (datasource URL)
```

### คำสั่งหลัก

คำสั่งทั้งหมดรันจาก `apps/backend/`:

```bash
cd apps/backend

# สร้างและรัน migration ใหม่
pnpm prisma migrate dev --name <ชื่อ>

# รัน migrations โดยไม่สร้างใหม่ (CI / production)
pnpm prisma migrate deploy

# เปิด Prisma Studio (GUI สำหรับดูและแก้ไขข้อมูล)
pnpm prisma studio
# → http://localhost:5555

# สร้าง client ใหม่ด้วยตนเอง
pnpm prisma generate
```

### การสร้าง client

Prisma สร้าง client ไว้ที่ `src/generated/prisma` — โฟลเดอร์นี้อยู่ใน `.gitignore`
client จะถูกสร้างอัตโนมัติตอน `migrate dev` แต่ก็สร้างเองได้ผ่าน `prisma generate`

---

## Migrations

โฟลเดอร์ `prisma/migrations/` จะถูก commit เข้า git — เป็นประวัติการเปลี่ยนแปลง schema ของฐานข้อมูล
ห้ามแก้ไขไฟล์ migration ด้วยมือเด็ดขาด

สำหรับ production ให้ใช้ `prisma migrate deploy` — จะรันเฉพาะ migrations ที่ค้างอยู่โดยไม่ถามอะไรแบบ interactive

---

## แก้ปัญหาความไม่ตรงกันระหว่าง schema กับ client ที่สร้างขึ้น

### ปัญหาเกิดขึ้นได้อย่างไร

Prisma ทำงานกับสิ่งที่แยกจากกันสองอย่าง:

1. **ประวัติ migration** — ไฟล์ใน `prisma/migrations/` ที่ commit เข้า git
2. **Client ที่สร้างขึ้น** — โค้ด TypeScript ใน `src/generated/prisma/` ที่ไม่ได้ commit (อยู่ใน `.gitignore`)

Client จะถูกสร้างจากสถานะจริงของฐานข้อมูล ณ ตอนรัน `prisma migrate dev` ถ้ามี migration ถูก apply กับฐานข้อมูลแล้ว แต่ไฟล์ของมันหายไปจาก `migrations/` — เช่น ถูกสร้างที่เครื่องอื่นหรือ branch อื่นแล้วไม่ได้ commit — client จะมี fields และ models ที่ไม่มีอยู่ใน `schema.prisma` ผลลัพธ์คือ: TypeScript error บน fields ที่ไม่มีอยู่จริงในโค้ด

สัญญาณของปัญหานี้ในผลลัพธ์ของ `migrate dev`:

```
Drift detected: Your database schema is not in sync with your migration history.
The following migration(s) are applied to the database but missing from the local migrations directory: 20260607165435_add_auth
```

### วิธีแก้สำหรับ dev environment

ต้อง reset ฐานข้อมูลให้ตรงกับสถานะที่อธิบายไว้ในไฟล์ migration ปัจจุบัน แล้วสร้าง client ใหม่:

```bash
cd apps/backend

# 1. Reset ฐานข้อมูลและ apply migrations ใหม่ทั้งหมด (ข้อมูลทั้งหมดจะถูกลบ)
pnpm prisma migrate reset

# 2. สร้าง client ใหม่จาก schema.prisma ปัจจุบัน
pnpm prisma generate
```

> `migrate reset` ไม่ได้รัน `generate` ให้อัตโนมัติ — ต้องสร้าง client ใหม่แยกต่างหาก
> หลังจากนั้น TypeScript error บน fields ที่ "ไม่มีอยู่จริง" จะหายไป

### กรณีที่วิธีนี้ใช้ไม่ได้

ถ้าความไม่ตรงกันเกิดขึ้นใน **production** หรือใน environment ที่มีข้อมูลที่ห้ามสูญหาย — `migrate reset` ใช้ไม่ได้ ในกรณีนี้ต้องกู้คืนไฟล์ migration ที่หายไปจากประวัติ git ของ branch หรือเครื่องอื่น หรือใช้ `prisma migrate resolve` เพื่อปรับสถานะให้ตรงกันด้วยตนเอง
