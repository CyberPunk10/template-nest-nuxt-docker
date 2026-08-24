# tsconfig.json

การตรวจสอบ type ของ backend — สิ่งที่ IDE เห็น และสิ่งที่ `pnpm type-check` รัน ส่วนการ build เป็นหน้าที่ของ [`tsconfig.build.json`](/th/guide/structure/apps/backend/tsconfig-build) ซึ่ง extends ไฟล์นี้

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "ES2023",
    "types": ["jest", "node"]
  },
  "include": ["src", "test"]
}
```

ที่เหลือ — `strict`, `skipLibCheck`, `noEmit` — มาจาก [config พื้นฐาน](/th/guide/structure/tsconfig-base)

## ทำไมต้อง commonjs

NestJS พึ่งพา decorator: `@Module`, `@Controller`, `@Injectable` ระบบ dependency injection ทำงานได้เพราะ metadata ของ type ที่ `emitDecoratorMetadata` สร้างขึ้น — และ flag นี้ใช้ร่วมกับ ESM แบบ native ไม่ได้

สามออปชันนี้จึงมาด้วยกัน:

| ออปชัน | ทำอะไร |
| --- | --- |
| `module: commonjs` | รูปแบบโมดูลที่ Nest ทำงานด้วย |
| `experimentalDecorators` | เปิดใช้ syntax ของ decorator |
| `emitDecoratorMetadata` | เก็บ type ของพารามิเตอร์ไว้ถึง runtime — DI อ่านค่านี้เพื่อรู้ว่าต้อง inject อะไร |

Config พื้นฐานกำหนด `module: ESNext` ไว้ ที่นี่จึง override

## ทำไม ES2023

แอปรันบน Node 24 จึงใช้ทุกอย่างที่ V8 เวอร์ชันนั้นรองรับได้ การลด `target` ไม่มีประโยชน์: โค้ดไม่ได้ไปที่เบราว์เซอร์ และการ transpile มีแต่จะทำให้ผลลัพธ์ใหญ่ขึ้น

## types: jest กับ node

ถ้าไม่ระบุรายการไว้ TypeScript จะดึงทุกแพ็กเกจใน `node_modules/@types` เข้ามา รวมถึงตัวที่ไม่เกี่ยว ที่นี่ระบุไว้สองตัว:

- **`jest`** — global อย่าง `describe`, `it`, `expect` ถ้าไม่มี spec จะขึ้น error `Cannot find name 'describe'`
- **`node`** — `process`, `Buffer`, `__dirname` และสภาพแวดล้อมฝั่ง server ที่เหลือ

## ทำไม include ถึงมี test

```json
"include": ["src", "test"]
```

`test/` เก็บ e2e spec ไว้ ถ้าไม่มีบรรทัดนี้ ไฟล์เหล่านั้นจะอยู่นอกโปรเจกต์: IDE จะมองไม่เห็น global ของ jest และ `pnpm type-check` จะข้ามไฟล์ไปเงียบ ๆ — error ของ type ใน test จะโผล่ตอนรันเท่านั้น

การ build ไม่ได้รับผลกระทบ: `tsconfig.build.json` ตัด `test` ออกต่างหาก
