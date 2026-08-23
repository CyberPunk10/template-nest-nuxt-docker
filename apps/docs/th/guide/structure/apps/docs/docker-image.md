# apps/docs

build static ของ VitePress ไปที่ `.vitepress/dist` — แล้วจบแค่นั้น ไม่มี `CMD` ใน image และไม่มี server ของตัวเอง: reverse proxy จะไปหยิบไฟล์ที่ build เสร็จแล้วมาตอน build ของตัวเอง แล้วเสิร์ฟที่ `/dev/docs/`

## ทำงานอย่างไร

`dist` ที่ build เสร็จเข้าไปใน image ของ proxy ในฐานะ build context:

```yaml
nginx:
  build:
    dockerfile: infra/nginx/Dockerfile
    additional_contexts:
      docs: service:docs-builder

docs-builder:
  build:
    dockerfile: apps/docs/Dockerfile
  scale: 0        # ใช้เป็นแหล่ง image เท่านั้น ไม่ได้ start เป็น container
```

ใน `infra/nginx/Dockerfile` หน้าตาแบบนี้:

```dockerfile
COPY --from=docs /app/apps/docs/.vitepress/dist /srv/docs
```

จุดประสงค์ของการแยก: แต่ละ application รับผิดชอบ build ของตัวเอง ส่วน proxy แค่เสิร์ฟผลลัพธ์

`scale: 0` ทำให้ `docs-builder` ไม่ถูก start ตอน `docker compose up` Compose ยัง build มันอยู่ดี เพราะถูกระบุเป็น build context ของ nginx แต่การ start container จากมันไม่มีประโยชน์: มันจะจบทันที เพราะไม่มีอะไรให้รันใน image

syntax `service:docs-builder` คือการอ้างอิง service อื่นของ compose เป็นแหล่งไฟล์ Compose รองรับ **ตั้งแต่เวอร์ชัน 2.33**; เวอร์ชันเก่ากว่านั้น build จะพังพร้อมข้อความ `failed to get build context docs`

## ดูผลลัพธ์

container นี้ไม่ได้รันเดี่ยวๆ — ไม่มีอะไรให้รัน เอกสารจะขึ้นมาพร้อมกับ proxy:

```bash
docker compose up -d nginx   # → http://localhost/dev/docs/
```

ถ้าจะแก้เนื้อหาเอกสารเอง ไม่ต้องใช้ Docker เลย ใช้ dev server เร็วกว่า:

```bash
pnpm --filter @repo/docs dev   # → http://localhost:5173/dev/docs/
```

## build image ด้วยมือ

ใช้ไม่บ่อย — เช่นเพื่อตรวจว่า build ผ่านไหม:

```bash
docker build -f apps/docs/Dockerfile -t docs-preview .
```

รันมันไม่ได้: container จะจบทันที เพราะไม่มี process ใน image

ลบทิ้งหลังตรวจเสร็จ:

```bash
docker rmi docs-preview
```
