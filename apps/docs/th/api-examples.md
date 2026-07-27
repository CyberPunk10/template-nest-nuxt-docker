---
outline: deep
---

# ตัวอย่าง Runtime API

หน้านี้แสดงตัวอย่างการใช้งาน runtime API บางส่วนที่ VitePress มีให้

API หลัก `useData()` ใช้เพื่อเข้าถึงข้อมูล site, theme และ page ของหน้าปัจจุบัน ใช้งานได้ทั้งในไฟล์ `.md` และ `.vue`:

```md
<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
</script>

## Results

### Theme Data

<pre>{{ theme }}</pre>

### Page Data

<pre>{{ page }}</pre>

### Page Frontmatter

<pre>{{ frontmatter }}</pre>
```

<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter } = useData()
</script>

## Results

### Theme Data

<pre>{{ theme }}</pre>

### Page Data

<pre>{{ page }}</pre>

### Page Frontmatter

<pre>{{ frontmatter }}</pre>

## เพิ่มเติม

ดูเอกสารสำหรับ [รายการ runtime API ทั้งหมด](https://vitepress.dev/reference/runtime-api#usedata)
