# Примеры расширений Markdown

Эта страница демонстрирует некоторые встроенные расширения markdown, которые предоставляет VitePress.

## Подсветка синтаксиса

VitePress предоставляет подсветку синтаксиса на основе [Shiki](https://github.com/shikijs/shiki), с дополнительными возможностями вроде подсветки строк:

**Ввод**

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

**Вывод**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Пользовательские контейнеры

**Ввод**

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

**Вывод**

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

## Подробнее

Смотрите документацию для [полного списка расширений markdown](https://vitepress.dev/guide/markdown).
