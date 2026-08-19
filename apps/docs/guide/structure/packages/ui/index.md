# packages/ui

Библиотека Vue-компонентов. Используется только фронтендом.

```
packages/ui/
├── src/
│   ├── components/     UiButton, UiBadge, UiCard
│   └── index.ts
├── package.json
└── tsconfig.json       не наследует base — нужен jsx + DOM
```

## Почему не компилируется

Пакет остаётся исходниками. Его потребляет только frontend, а Vite обрабатывает `.vue` и `.ts` напрямую — промежуточная сборка не нужна.

Скомпилировать его обычным `tsc` и не получилось бы: `.vue`-файлы требуют `vue-tsc` и отдельного пайплайна. `tsconfig.json` здесь нужен лишь для `vue-tsc --noEmit` при проверке типов.

Отсюда и алиас: `@repo/ui` резолвится в `src/index.ts` — прямо в исходник, в отличие от [shared](/guide/structure/packages/shared/).

## Своя настройка TypeScript

**Не наследует** `tsconfig.base.json`: ему нужны `jsx` и библиотека `DOM`, которых в базовом конфиге нет.

Манифест пакета — [package.json](/guide/structure/packages/ui/package-json).
