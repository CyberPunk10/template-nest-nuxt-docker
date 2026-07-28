# pnpm และ Corepack

## Requirement ของโปรเจกต์

```json
"packageManager": "pnpm@11.12.0",
"engines": {
  "node": ">=24",
  "pnpm": ">=11",
  "npm": "please-use-pnpm"
}
```

`.npmrc` มี `engine-strict=true` — `pnpm install` จะ **ปฏิเสธ** ติดตั้ง dependency บน Node version ที่ไม่รองรับ แทนที่จะติดตั้งเงียบๆ แล้วไปพังตอน runtime ทีหลัง

## ปัญหา: ติดตั้ง pnpm หลาย version พร้อมกันในเครื่องเดียว

ในเครื่องเดียว pnpm สามารถติดตั้งได้อย่างน้อย 3 วิธี และแต่ละวิธี **ไม่รู้จักกัน**:

| วิธี                                           | ตัวอย่าง path                                    | ใครจัดการ                             |
| -------------------------------------------- | ---------------------------------------------- | ------------------------------------ |
| Standalone script (`get.pnpm.io/install.sh`) | `~/.local/share/pnpm/pnpm`                     | จัดการตัวเอง version ถูกล็อกตอนติดตั้ง      |
| `npm install -g pnpm`                        | `~/.nvm/versions/node/vX.Y.Z/bin/pnpm`         | Node version ที่ active อยู่ใน nvm ตอนนั้น |
| System package / global npm                  | `/usr/bin/pnpm` → `/usr/lib/node_modules/pnpm` | Node ของระบบ นอก nvm                 |
| **Corepack**                                 | shim ที่แทน version จาก `packageManager`         | `package.json` ของ **แต่ละ** โปรเจกต์  |

ถ้ามีหลายวิธีติดตั้งพร้อมกัน การเรียก `pnpm ...` ใน terminal จะรันตัวที่ **มาก่อนใน `$PATH`** — ไม่จำเป็นต้องเป็นตัวที่โปรเจกต์ปัจจุบันต้องการ การติดตั้งแบบ standalone ผ่าน `~/.zshrc` (`export PATH="$PNPM_HOME:$PATH"`) จะจงใจเอาตัวเองไปไว้หน้าสุดของ `PATH` เลย ทำให้ intercept การเรียกก่อนที่ Corepack shim จะได้ทำงาน

### อาการที่เจอในทางปฏิบัติ

อาการ — pnpm version เก่าไม่เข้าใจ lockfile ที่สร้างจาก version ใหม่กว่า:

```
[ERROR] Cannot use 'in' operator to search for 'integrity' in undefined
```

หรือ error ที่บอกชัดว่าไม่ตรงกับ `engines.pnpm` ใน `package.json`:

```
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=11
Got: 8.15.5
```

ตรวจสอบว่าอันไหนถูกเรียกจริงๆ:

```bash
which pnpm       # binary ไหนถูก resolve ก่อน
pnpm --version   # มันรายงาน version อะไร
```

ถ้า version ไม่ตรงกับ `packageManager` ใน `package.json` ของโปรเจกต์ที่เปิดอยู่ — แปลว่าหนึ่งในสามวิธี "ติดตั้งตรง" ทำงานอยู่ ไม่ใช่ Corepack

## Corepack — วิธีที่แนะนำ

[Corepack](https://nodejs.org/api/corepack.html) มากับ Node.js อยู่แล้ว (เสถียรตั้งแต่ v16.9+) และแก้ปัญหาด้วยวิธีที่ต่างออกไป: แทนที่จะติดตั้ง pnpm แบบ global ด้วย version คงที่ มันจะแทน version ที่ระบุใน `packageManager` ของโปรเจกต์ที่เปิดอยู่ **ทุกครั้งที่รัน** เปิดโปรเจกต์ A ที่ใช้ `pnpm@9` — รัน `9`; สลับไปโปรเจกต์ B ที่ใช้ `pnpm@11.12.0` — รัน `11.12.0` ไม่ต้องมี global version ให้ตามดูเอง

นี่คือวิธีที่แนะนำอย่างเป็นทางการสำหรับโปรเจกต์ที่มี field `packageManager` — ถ้าไม่ใช้ Corepack field นี้จะกลายเป็นแค่ข้อความเฉยๆ ไม่มีผลอะไร version จะเพี้ยนไปเงียบๆ แล้วจะรู้ตัวอีกทีก็ตอนมีอะไรพังแล้ว

### คำสั่งพื้นฐาน

```bash
corepack enable                # เปิดใช้ Corepack แบบ global
corepack disable               # ปิด

corepack use pnpm@latest       # อัปเดต packageManager ของโปรเจกต์เป็น version ล่าสุด
corepack use pnpm@9.15.0       # ล็อก version ที่ต้องการ

corepack install               # ติดตั้ง version ที่ระบุไว้ใน packageManager ของ package.json ปัจจุบัน
```

`corepack use pnpm@X` ไม่ได้แค่สลับ version — มันอัปเดต `packageManager` ใน `package.json` ด้วย และเพิ่ม integrity hash ให้ (`pnpm@11.12.0+sha512.<hash>`) ซึ่ง Corepack ใช้ตรวจสอบความถูกต้องของ binary ที่ดาวน์โหลดมาทุกครั้งที่ติดตั้ง

### ใน monorepo — ใส่ field แค่ที่ root

`packageManager` เป็น setting ของ **workspace ทั้งหมด** pnpm อ่านแค่จาก `package.json` ที่ root เท่านั้น ไม่ต้องเพิ่มใน `apps/*/package.json` — pnpm จะไม่สนใจอยู่ดี แถมการซ้ำแบบนี้ยังเสี่ยงลืมอัปเดตอีกชุดหนึ่งด้วย

## ย้ายมาใช้ Corepack: ทีละขั้นตอน

ถ้าเครื่องมีวิธีติดตั้งแบบ "ตรง" อยู่แล้วหนึ่งหรือหลายวิธี ควรเอาออกทีละอัน ไม่งั้น Corepack จะโดนแทนที่ต่อไปด้วยตัวที่มาก่อนใน `$PATH`

### 1. Standalone install (`~/.local/share/pnpm`)

```bash
rm -rf ~/.local/share/pnpm
```

จากนั้นลบ block ใน `~/.zshrc` (หรือ `~/.bashrc`) — ปกติจะหน้าตาแบบนี้:

```bash
# pnpm
export PNPM_HOME="/home/user/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
```

### 2. Global pnpm ภายใน Node version ของ nvm

```bash
npm uninstall -g pnpm
corepack enable
```

ถ้าใช้ Node หลาย version ผ่าน nvm — ตรวจสอบทีละตัว:

```bash
for d in ~/.nvm/versions/node/*/; do
  [ -d "$d/lib/node_modules/pnpm" ] && echo "$(basename "$d"): pnpm ติดตั้งแบบ global อยู่"
done
```

### 3. System install (`/usr/bin/pnpm`)

```bash
sudo rm /usr/bin/pnpm /usr/bin/pnpx /usr/bin/pn /usr/bin/pnx
sudo rm -rf /usr/lib/node_modules/pnpm
```

### ตรวจสอบหลังทำแต่ละขั้นตอน

```bash
which pnpm       # path ควรผ่าน corepack shim
pnpm --version   # ควรตรงกับ packageManager ใน package.json
```

ทำซ้ำขั้นตอน 1–3 ตามลำดับ ตรวจสอบ `which pnpm` ใหม่หลังทำแต่ละขั้น — จะเห็นได้ทันทีว่าวิธีไหน intercept คำสั่งอยู่ในลำดับถัดไป

## Corepack ใน Docker

Base image ของ Node (`node:24-alpine` และอื่นๆ) มี Corepack มาให้อยู่แล้ว แต่ใน Node version ใหม่ๆ จะยังไม่ได้เปิดใช้งานโดย default — ต้องเปิดเองใน `Dockerfile`:

```dockerfile
FROM node:24-alpine
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

**ห้ามล็อก pnpm version เองใน `Dockerfile`** (`RUN npm install -g pnpm@X.Y.Z`) — จะทำให้เกิดปัญหาเพี้ยนเหมือนกับในเครื่อง local: version ที่ฝังใน image อาจเพี้ยนไปจาก `packageManager` ของโปรเจกต์อย่างเงียบๆ `corepack enable` + `packageManager` ใน `package.json` ควรเป็น source of truth เดียวเสมอ — แล้ว version ภายใน container จะตรงกับที่นักพัฒนาใช้อัตโนมัติ
