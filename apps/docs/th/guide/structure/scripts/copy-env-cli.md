# copy-env-cli.mjs

CLI runner แบบบาง: อ่าน flag `--force` จาก argument แล้วเรียก `copyEnvFiles()`

```js
import { copyEnvFiles } from './copy-env.mjs'

const force = process.argv.includes('--force')

copyEnvFiles(force)
```

จึงมี npm script สองตัว:

```bash
pnpm env:copy          # node scripts/copy-env-cli.mjs
pnpm env:copy:force    # node scripts/copy-env-cli.mjs --force
```

แยกออกจาก [`copy-env.mjs`](/th/guide/structure/scripts/copy-env) เพื่อให้ตัว module เองสะอาด (ไม่มี side effect ตอน import) — side effect ทั้งหมดอยู่ในไฟล์นี้ไฟล์เดียว ซึ่งถูกเรียกจาก npm script เท่านั้น
