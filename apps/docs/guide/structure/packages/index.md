# packages/

Две библиотеки, которые используют приложения. Подключаются как `workspace:*` — pnpm связывает их симлинками, публикация в реестр не нужна.

```
packages/
├── shared/      типы (DTO) и переводы — для backend и frontend
└── ui/          Vue-компоненты — только для frontend
```

| Пакет | Кто использует | Сборка |
| --- | --- | --- |
| [shared](/guide/structure/packages/shared/) | backend, frontend | компилируется в `dist/` (ESM) |
| [ui](/guide/structure/packages/ui/) | frontend | не компилируется, source-only |

Разница в сборке не случайна: `shared` попадает в два разных рантайма, `ui` — только во frontend, где Vite обрабатывает исходники напрямую. Подробный разбор — [Архитектура](/guide/architecture#пакеты-как-потребляются).
