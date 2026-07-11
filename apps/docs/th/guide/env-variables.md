# ENV-variables

## ไฟล์

```
apps/backend/.env[.example]  # NestJS อ่านโดยตรง
apps/frontend/.env[.example] # Nuxt อ่านโดยตรง
```

- แต่ละแอปพลิเคชันอ่าน `.env` **ของตัวเองเท่านั้น**
- หากไม่มี `.env` ไฟล์จะถูกคัดลอกจาก `.env.example` **โดยอัตโนมัติ** เมื่อรัน `pnpm dev` (ด้วย `predev.mjs`)

---

## ทำไมตัวแปรถึงซ้ำกัน

### `BACKEND_URL` vs `NUXT_PUBLIC_BACKEND_URL`

ทั้งคู่คือ «ที่อยู่ของ backend» แต่สำหรับผู้ใช้งานคนละกลุ่ม:

| ตัวแปร                     | ไฟล์                  | ใครอ่าน            | ค่า                                     |
| ------------------------- | -------------------- | ----------------- | -------------------------------------- |
| `BACKEND_URL`             | `apps/frontend/.env` | Nuxt SSR (server) | `http://localhost:3001` เมื่อ `pnpm dev` |
| `NUXT_PUBLIC_BACKEND_URL` | `apps/frontend/.env` | Browser           | `http://localhost:3001`                |

ใน Docker ค่าทั้งสองถูกส่งโดยตรงผ่าน `docker-compose.yml`: `BACKEND_URL` เป็น `http://backend:3001` (ชื่อ service ภายในเครือข่าย Docker), `NUXT_PUBLIC_BACKEND_URL` เป็น `http://localhost:3001`

`NUXT_PUBLIC_` เป็น prefix บังคับของ Nuxt สำหรับตัวแปรที่เข้าถึงได้จาก browser ไม่สามารถลบความซ้ำซ้อนนี้ได้: เป็นข้อจำกัดของ framework

### `CORS_ORIGIN`

มีเฉพาะใน `apps/backend/.env` สำหรับการรันบนเครื่อง local (`pnpm dev`) ใน Docker จะถูกส่งโดยตรงผ่าน `docker-compose.yml`

---

## ผังภาพ: อะไรถูกอ่านจากที่ไหน

### `pnpm dev`

```
apps/backend/.env   →  PORT, CORS_ORIGIN
apps/frontend/.env  →  PORT, NUXT_PUBLIC_BACKEND_URL, BACKEND_URL
```

### Docker

```
docker-compose.yml (ค่าถูก hardcode ไว้)
  backend:   PORT=3001, CORS_ORIGIN=http://localhost:3000
  frontend:  NUXT_PUBLIC_API_BASE=/api/backend,
             NUXT_PUBLIC_APP_ENV=production,
             NUXT_PUBLIC_BACKEND_URL=http://localhost:3001,
             BACKEND_URL=http://backend:3001
```

---

## `predev.mjs`

รันโดยอัตโนมัติก่อน `pnpm dev` (ตามธรรมเนียม npm `pre*`) ทำสามอย่าง:

1. หากไม่มี `apps/backend/.env` หรือ `apps/frontend/.env` — คัดลอกจาก `.env.example`
2. หาก port ที่ต้องการถูกใช้งานอยู่ — เสนอให้ kill process บน port นั้นหรือยกเลิกการรัน
3. รัน PostgreSQL ผ่าน `docker-compose.dev.yml` หาก container ยังไม่ได้ทำงาน (idempotent; หากไม่มี Docker — จะเตือนแล้วดำเนินการต่อ)

รายละเอียดเพิ่มเติมเกี่ยวกับโหมดการรัน — ดู [การพัฒนา](/th/guide/development)
