# packages/

ไลบรารี 2 ตัวที่แอปพลิเคชันเรียกใช้ เชื่อมกันแบบ `workspace:*` — pnpm ทำ symlink ให้ ไม่ต้อง publish ขึ้น registry

```
packages/
├── shared/      type (DTO) และคำแปล — สำหรับ backend และ frontend
└── ui/          Vue component — สำหรับ frontend เท่านั้น
```

| Package | ใครใช้ | การ build |
| --- | --- | --- |
| [shared](/th/guide/structure/packages/shared/) | backend, frontend | ใช้เป็นซอร์สโดยตรง |
| [ui](/th/guide/structure/packages/ui/) | frontend | ใช้เป็นซอร์สโดยตรง |

ทั้งคู่ไม่ต้อง compile: Vite และ Nest จัดการซอร์สโดยตรงผ่าน alias ของ workspace รายละเอียดเต็ม — [สถาปัตยกรรม](/th/guide/architecture#packages-ใช้งานอย่างไร)
