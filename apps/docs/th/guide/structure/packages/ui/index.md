# packages/ui

ไลบรารี Vue component ใช้โดย frontend เท่านั้น

```
packages/ui/
├── src/
│   ├── components/     UiButton, UiBadge, UiCard
│   └── index.ts
├── package.json
└── tsconfig.json       ไม่ extend base — ต้องการ jsx + DOM
```

## ทำไมไม่ compile

package นี้ยังเป็นซอร์สโค้ด มีแค่ frontend ที่ใช้ และ Vite จัดการ `.vue` กับ `.ts` ได้โดยตรง — ไม่ต้องมีขั้น build กลางทาง

จะ compile ด้วย `tsc` ธรรมดาก็ไม่ได้อยู่ดี: ไฟล์ `.vue` ต้องใช้ `vue-tsc` และ pipeline เฉพาะของมัน `tsconfig.json` ที่นี่มีไว้สำหรับ `vue-tsc --noEmit` ตอนตรวจ type เท่านั้น

## การตั้งค่า TypeScript ของตัวเอง

เป็น package เดียวที่ **ไม่ extend** `tsconfig.base.json`: มันต้องการ `jsx` และ lib `DOM` ซึ่ง base config ไม่มี

Manifest ของ package — [package.json](/th/guide/structure/packages/ui/package-json)
