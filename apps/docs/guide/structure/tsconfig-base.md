# tsconfig.base.json

```
tsconfig.base.json               ← корень монорепо, только для IDE и type-check
│  strict, ES2022
│  paths: {
│    "@repo/shared" → packages/shared/src/index.ts
│    "@repo/ui"     → packages/ui/src/index.ts
│  }
│  Оба пакета source-only: указывают на исходники, сборка им не нужна.
│  Эти пути нужны только IDE для резолва типов.
│  В рантайме модули резолвятся через pnpm workspace (package.json → main).
│
├── shared/tsconfig.json    ← наследует base, добавляет resolveJsonModule
│      resolveJsonModule нужен для переводов: i18n лежит в .json
│
├── ui/tsconfig.json        ← НЕ наследует base (нужен jsx + DOM lib)
│      source-only пакет, dist не нужен — Nuxt/Vite обрабатывает .vue напрямую
│      Используется только для vue-tsc --noEmit (type-check).
│
├── docs/tsconfig.json      ← НЕ наследует base (Vue-приложение, нужен DOM)
│      types: ["vitepress/client", "node"]
│      vitepress/client реэкспортирует vite/client — оттуда объявления
│      модулей *.vue и *.css, без них импорты в theme/ считаются ошибкой.
│      Проверяется через vue-tsc --noEmit, как и ui.
│
├── frontend/tsconfig.json  ← только точка входа для IDE
│      Реальные конфиги Nuxt генерирует в .nuxt/ при nuxt prepare,
│      этот файл лишь ссылается на них через references.
│
└── backend/tsconfig.json        ← для IDE и type-check, noEmit: true
       module: commonjs
       experimentalDecorators: true   ← нужно для NestJS декораторов
       │
       └── backend/tsconfig.build.json   ← для nest build, noEmit: false
              rootDir: ./src             ← даёт чистый dist/main.js
              outDir: ./dist             ← без вложенных путей apps/backend/src/...
```

Проверка типов запускается одной командой из корня:

```bash
pnpm type-check
```

Она обходит все воркспейсы: `tsc --noEmit` для backend и shared, `vue-tsc --noEmit` для ui и docs (обычный `tsc` не разбирает `.vue`), `nuxt typecheck` для frontend.
