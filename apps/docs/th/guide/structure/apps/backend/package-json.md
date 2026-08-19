# package.json

Manifest ของ application สคริปต์ทำงานเฉพาะใน workspace ของตัวเอง — จาก root เรียกผ่าน filter (`pnpm --filter backend dev`) หรือโดยอ้อมจากคำสั่งที่ root

| สคริปต์                                           | คำสั่ง                  | ทำอะไร                                     |
| ----------------------------------------------- | -------------------- | ----------------------------------------- |
| `dev`                                           | `nest start --watch` | Develop ในเครื่อง มี hot-reload              |
| `build`                                         | `nest build`         | Production build เป็น `dist/`              |
| `start`                                         | `nest start`         | รัน `dist/` ที่ build แล้วโดยไม่มี watch        |
| `start:prod`                                    | `node dist/main`     | รันในโหมด production (สิ่งที่ `Dockerfile` ใช้) |
| `lint`                                          | `eslint ... --fix`   | Linter พร้อม auto-fix                      |
| `type-check`                                    | `tsc --noEmit`       | ตรวจสอบ type โดยไม่ build                  |
| `test` / `test:watch` / `test:cov` / `test:e2e` | `jest ...`           | Unit test และ e2e test                    |

อะไรอยู่ที่ไหน — [apps/backend](/th/guide/structure/apps/backend/)
