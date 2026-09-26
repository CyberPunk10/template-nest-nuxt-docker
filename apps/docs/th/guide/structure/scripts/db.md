# db.mjs

จัดการ container ฐานข้อมูล ใช้ได้ทั้งเป็น CLI (`pnpm db:up` / `pnpm db:down`) และเป็น module — `dbUp()` ถูกเรียกจาก [`predev.mjs`](/th/guide/structure/scripts/predev)

ฐานข้อมูลถูกประกาศไว้ใน `docker-compose.yml` ไฟล์เดียวกันโดยไม่มี profile ส่วน service ของแอปอยู่ภายใต้ profile `app` ด้วยเหตุนี้คำสั่งที่ไม่ระบุ profile จึงแตะเฉพาะ `postgres` — รายละเอียดใน [docker-compose.yml](/th/guide/structure/docker-compose#profile)

## คำสั่ง

| คำสั่ง         | ทำอะไร                                                             |
| -------------- | ------------------------------------------------------------------ |
| `pnpm db:up`   | สร้าง network ถ้าจำเป็น, ยก `postgres` ขึ้นมา และรอ healthcheck      |
| `pnpm db:down` | หยุด `postgres` ข้อมูลยังอยู่ใน volume                              |

โดยทั่วไปไม่ค่อยต้องใช้ `db:up` เดี่ยว ๆ เพราะ `pnpm dev` ยกฐานข้อมูลขึ้นมาให้เอง จะมีประโยชน์ตอนที่ไม่ต้องการรันแอป — เช่น เพื่อรัน migration หรือเชื่อมต่อด้วย client

## การรอให้พร้อมใช้งาน

`up` ใส่ flag `--wait` ไว้: คำสั่งจะคืนค่าเมื่อ healthcheck กลายเป็น `healthy` ไม่ใช่ตอนที่สร้าง container เสร็จ ถ้าไม่มี flag นี้ Nest จะเริ่มเชื่อมต่อก่อนที่ Postgres จะรับ connection แล้วล้มตอน start

```js
compose(['up', '-d', '--wait', 'postgres'])
```

healthcheck ถูกประกาศไว้ที่ service `postgres` และอาศัย `pg_isready`

## ทำไม `down` แค่หยุด

`dbDown()` เรียก `docker compose stop` ไม่ใช่ `down` ผลลัพธ์ต่างกัน: `down` จะลบ container ส่วน `down -v` จะลบ volume พร้อมข้อมูลไปด้วย การลบข้อมูลจึงตั้งใจไม่ห่อไว้ในคำสั่ง pnpm เพื่อไม่ให้เกิดขึ้นด้วยความเคยชิน:

```bash
docker compose down -v   # ลบฐานข้อมูลพร้อมข้อมูลทั้งหมด
```

## การใช้เป็น module

```js
import { dbUp } from './db.mjs'

dbUp()   // network + postgres + รอ healthcheck
```
