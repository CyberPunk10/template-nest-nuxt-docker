# copy-env.mjs

`copy-env.mjs` คือ module ที่ใช้ร่วมกัน เก็บ path ของ `.env`/`.env.example` ทั้งหมด และฟังก์ชัน `copyEnvFiles()` ที่คัดลอกทั้งสี่ไฟล์พร้อมกันถ้ายังไม่มี

`parseEnv(filePath)` ก็อยู่ที่นี่ด้วย — แปลงไฟล์ `.env` เป็น object `{ KEY: 'value' }` โดยข้ามคอมเมนต์และบรรทัดว่าง

## การใช้งาน

```js
import { copyEnvFiles, parseEnv, ROOT_ENV } from './copy-env.mjs'

// สร้างเฉพาะ .env ที่ยังไม่มี — ไฟล์เดิมไม่ถูกแตะ
copyEnvFiles()

// เขียนทับ .env ทั้งหมดด้วยค่าจาก .env.example
copyEnvFiles(true)

// อ่านค่าตัวแปร
const port = parseEnv(ROOT_ENV).NGINX_HOST_PORT
```

จาก command line — ผ่าน npm script:

```bash
pnpm env:copy          # สร้างเฉพาะที่ขาด
pnpm env:copy:force    # เขียนทับทั้งหมด
```

::: warning
`--force` เขียนทับไฟล์ **ทั้งไฟล์** ไม่ใช่เติมเฉพาะบรรทัดที่ขาด ทุกอย่างที่คุณแก้ด้วยมือ — พอร์ต, secret, การตั้งค่าเฉพาะเครื่อง — จะหายไป
:::
