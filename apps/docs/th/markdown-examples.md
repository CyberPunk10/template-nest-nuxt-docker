# ตัวอย่างส่วนขยาย Markdown

หน้านี้แสดงตัวอย่างส่วนขยาย markdown ที่มีมาพร้อมกับ VitePress

## Syntax Highlighting

VitePress มี Syntax Highlighting ขับเคลื่อนโดย [Shiki](https://github.com/shikijs/shiki) พร้อมฟีเจอร์เพิ่มเติมอย่างการไฮไลต์บรรทัด:

**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## เพิ่มเติม

ดูเอกสารสำหรับ [รายการส่วนขยาย markdown ทั้งหมด](https://vitepress.dev/guide/markdown)
