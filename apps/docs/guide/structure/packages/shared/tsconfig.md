# tsconfig.json

Самый короткий конфиг в репозитории — пакету почти ничего не нужно сверх [базового](/guide/structure/tsconfig-base):

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

Переводы лежат в `src/i18n/*/*.json` и импортируются напрямую:

```ts
import ru from './ru.json'
```

Без этой опции TypeScript откажется резолвить такой импорт. Она же даёт типизацию по содержимому файла — структура перевода выводится автоматически.

## Почему больше ничего не нужно

Пакет source-only: в `package.json` поля `main` и `types` указывают прямо на `src/index.ts`, сборки нет. Потребители — Nuxt через Vite, бэкенд через `nest build` — компилируют исходники сами, каждый под своё окружение.

Поэтому здесь не нужны ни `target`, ни `lib`, ни `outDir`: пакет не привязан к среде исполнения. Один и тот же код едет и в браузер, и в Node.

## Проверка типов

```bash
pnpm --filter @repo/shared type-check
```

Обычный `tsc --noEmit` — в пакете только `.ts`, Vue-компонентов нет.
