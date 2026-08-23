# เริ่มต้นใช้งาน

## เริ่มแบบเร็ว

ต้องมี [Node.js >= 24 และ pnpm](/th/guide/getting-started/setup) — ที่เหลือ script จัดการให้:

```bash
git clone git@github.com:CyberPunk10/template-nest-nuxt-docker.git
cd template-nest-nuxt-docker
pnpm install
pnpm dev
```

เปิดที่ [http://localhost:3200](http://localhost:3200) ส่วนที่เหลือในหน้านี้เป็นเรื่องว่าโหมดนี้ต่างจาก Docker อย่างไร และต้องตั้งค่าอะไรถ้ามีอะไรไม่ทำงาน

## สองโหมด

รันโปรเจกต์ได้สองแบบ แต่ละแบบมีจุดประสงค์ของตัวเอง:

|                                                    | ใช้ทำอะไร                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [**pnpm**](/th/guide/getting-started/run-pnpm)     | พัฒนางานประจำวัน: hot reload เริ่มเร็ว ไม่ต้องใช้ container      |
| [**Docker**](/th/guide/getting-started/run-docker) | ซ้อม production: image และโครงสร้างเดียวกับที่จะขึ้น deploy      |

ทั้งสองโหมดรัน application ชุดเดียวกัน ต่างกันแค่วิธีเข้าถึง: ใน pnpm แต่ละตัวฟังพอร์ตของตัวเอง ส่วนใน Docker ทุกอย่างเข้ามาที่ reverse proxy

## เริ่มจากตรงไหน

1. [การเตรียมความพร้อม](/th/guide/getting-started/setup) — Node.js, pnpm, Docker, ไฟล์ `.env`
2. [รันด้วย pnpm](/th/guide/getting-started/run-pnpm) หรือ [ด้วย Docker](/th/guide/getting-started/run-docker)

## ความต่างของสองโหมด

| อะไร          | pnpm dev                          | Docker                       |
| ------------- | --------------------------------- | ---------------------------- |
| Application   | `http://localhost:3200`           | `http://localhost/`          |
| เอกสาร        | `http://localhost:5173/dev/docs/` | `http://localhost/dev/docs/` |
| Swagger       | `http://localhost:3100/api/docs`  | `http://localhost/api/docs`  |
| Hot reload    | มี                                 | ไม่มี                          |
| Reverse proxy | ไม่มี                               | มี                            |

path ตรงกัน ต่างแค่ host กับพอร์ต — address ถูกเก็บไว้ใน environment variable เพื่อให้โค้ดไม่ต้องรู้จักมัน
