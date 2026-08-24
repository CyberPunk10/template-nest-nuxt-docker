# tsconfig.json

Config ที่สั้นที่สุดใน repo — แพ็กเกจนี้แทบไม่ต้องการอะไรเพิ่มจาก [ตัวพื้นฐาน](/th/guide/structure/tsconfig-base):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

## resolveJsonModule

คำแปลอยู่ใน `src/i18n/*/*.json` และถูก import โดยตรง:

```ts
import ru from './ru.json'
```

ถ้าไม่มีออปชันนี้ TypeScript จะไม่ยอม resolve การ import แบบนั้น อีกทั้งยังให้ type ตามเนื้อหาไฟล์ — โครงสร้างของคำแปลถูก infer ให้อัตโนมัติ

## ทำไมไม่ต้องมีอย่างอื่น

แพ็กเกจนี้เป็นแบบ source-only: `main` และ `types` ใน `package.json` ชี้ตรงไปที่ `src/index.ts` และไม่มีขั้นตอน build ผู้ใช้งาน — Nuxt ผ่าน Vite และ backend ผ่าน `nest build` — compile ซอร์สเอง แต่ละตัวตามสภาพแวดล้อมของตน

จึงไม่ต้องมี `target`, `lib` หรือ `outDir`: แพ็กเกจไม่ผูกกับ runtime ใด โค้ดชุดเดียวกันไปได้ทั้งเบราว์เซอร์และ Node

## การตรวจสอบ type

```bash
pnpm --filter @repo/shared type-check
```

ใช้ `tsc --noEmit` ธรรมดา — ในแพ็กเกจมีแต่ `.ts` ไม่มี Vue component
