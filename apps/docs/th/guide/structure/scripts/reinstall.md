# reinstall.mjs

ลบ `node_modules` และ `pnpm-lock.yaml` (ถ้ามี) แล้วรัน `pnpm install` ใหม่ทั้งหมด

::: warning ไม่ใช่วิธีอัปเดต dependency
การลบ `pnpm-lock.yaml` จะล้าง version ที่ล็อกไว้ของ transitive dependency ทั้งหมด — `pnpm install` จะ resolve ใหม่ภายในขอบเขตที่ `package.json` อนุญาต (`^`/`~`) ซึ่งหมายความว่าอาจดึง minor/patch version ใหม่ของ transitive package มาแบบเงียบๆ รวมถึง breaking change ที่อาจมีอยู่ในนั้นด้วย ในช่วงต้นของ template ที่ยังมี dependency ไม่เยอะ นี่เป็นวิธีที่ถูกในการแก้ปัญหา state ที่เพี้ยนในเครื่อง (เช่น หลังสลับ branch ที่มี lockfile ต่างกัน) แต่พอโปรเจกต์โตไปถึง production ที่ dependency tree นิ่งแล้ว ไม่ควรอัปเดตด้วยวิธีนี้อีก — การอัปเดต version ใดๆ ควรตั้งใจทำและเห็นได้ใน diff ของ `pnpm-lock.yaml` ไม่ใช่ผลจากการคำนวณใหม่ทั้งหมดตั้งแต่ต้น

วิธีที่ถูกต้องในการอัปเดต dependency คือ `pnpm update` (อัปเดตภายในขอบเขตจาก `package.json` แค่ต่อยอด lockfile เดิม ไม่ลบทิ้ง) หรือ `pnpm update --interactive` (แสดง list ของ update ที่มี ให้เลือกว่าจะรับตัวไหน) สำหรับอัปเดตทีละ package — `pnpm update <package>`
:::

มีประโยชน์ตอนที่ dependency ในเครื่องเพี้ยนไป (เช่น หลังสลับ branch ที่มี lockfile ต่างกัน) และต้องการเริ่มใหม่แบบสะอาด — แต่ไม่ใช่เครื่องมือที่ใช้ประจำวัน

## การใช้งาน

```bash
pnpm reinstall
```
