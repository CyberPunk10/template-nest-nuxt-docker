# prisma/tsconfig.seed.json

Config สำหรับ `prisma db seed`

```json
{
  "extends": "../tsconfig.json",
  "include": ["./seed.ts"]
}
```

สืบทอดจาก [`tsconfig.json`](/th/guide/structure/apps/backend/tsconfig) ของ backend จึงได้ทั้งการตั้งค่าของ Nest และกฎร่วมจาก [config พื้นฐาน](/th/guide/structure/tsconfig-base) ที่เพิ่มเข้ามาเองมีแค่ `include`

## ทำไมต้องแยกไฟล์

Script seed รันผ่าน `ts-node` ไม่ใช่ `nest build` คำสั่งอยู่ใน `prisma.config.ts`:

```ts
seed: 'ts-node --transpile-only --project prisma/tsconfig.seed.json prisma/seed.ts'
```

`ts-node` ต้องการ `--project` ที่ชี้ไปยัง config ไฟล์นี้มีอยู่เพื่อสิ่งเดียว: ระบุ `seed.ts` เป็นจุดเริ่มต้น แล้วสืบทอดที่เหลือทั้งหมด

## ทำไมไม่ต้องมีอย่างอื่น

`--transpile-only` ปิดการตรวจ type ตอนรัน: `ts-node` เพียงแปลง TypeScript เป็น JavaScript แล้วรันผลลัพธ์ใน memory ไม่มีอะไรเขียนลงดิสก์ ดังนั้น `noEmit: true` จาก config พื้นฐานจึงไม่ขัดขวาง และไม่ต้องมีทั้ง `outDir` และ `rootDir`

การตรวจ type ก็ไม่ได้หายไป — `seed.ts` ถูกครอบคลุมโดย `pnpm type-check` ของ backend เพราะมันอยู่ใน `apps/backend` ไม่มีคำสั่งแยกสำหรับมัน

## Prisma client ที่ generate มา

`seed.ts` import client จาก `src/generated/prisma/client`:

```ts
import { PrismaClient } from '../src/generated/prisma/client'
```

ไม่จำเป็นต้องระบุไฟล์เหล่านั้นใน `include` — TypeScript หาเจอเองตาม import ส่วนโฟลเดอร์ `src/generated/` อยู่ใน gitignore: client ถูกสร้างด้วย `prisma generate` จาก [schema](/th/guide/database) และไม่เข้าไปใน repo
