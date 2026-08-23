# .husky/

Git hook ของโปรเจกต์

```
.husky/
├── pre-commit          รัน lint-staged ก่อน commit
└── _/                  ไฟล์ภายในของ husky ไม่เข้า git
```

## Hook ก่อน commit

`.husky/pre-commit` เรียก `lint-staged` — linter จึงตรวจ **เฉพาะไฟล์ที่แก้** ไม่ใช่ทั้ง repository hook ติดตั้งเองอัตโนมัติ: ใน `package.json` ที่ root มี script `prepare: husky` ที่ pnpm รันหลังติดตั้ง dependency

ตัว hook เองมีบรรทัดเดียว:

```bash
pnpm lint-staged
```

ส่วนที่ว่าจะรันอะไรกับไฟล์เหล่านั้น กำหนดโดย `lint-staged.config.js` ที่ root: `eslint --fix` สำหรับ `js/mjs/ts/tsx/vue`

## ข้ามการตรวจแบบครั้งเดียว

```bash
git commit --no-verify -m "..."
```

Flag นี้ข้าม hook ทั้งหมด ใช้เท่าที่จำเป็น: linter ตอน commit คือด่านตรวจสุดท้ายก่อนโค้ดจะไปอยู่ใน branch ที่ใช้ร่วมกัน
