# packages/

Two libraries used by the applications. They are linked as `workspace:*` — pnpm symlinks them, no registry publishing involved.

```
packages/
├── shared/      types (DTOs) and translations — for backend and frontend
└── ui/          Vue components — frontend only
```

| Package                                        | Used by           | Build       | Type check                      |
| ---------------------------------------------- | ----------------- | ----------- | ------------------------------- |
| [shared](/en/guide/structure/packages/shared/) | backend, frontend | source-only | `tsc --noEmit`                  |
| [ui](/en/guide/structure/packages/ui/)         | frontend          | source-only | `vue-tsc --noEmit` — for `.vue` |

Neither is compiled: `main` points straight at `src/index.ts`, and the consumers handle the sources themselves — Nest with `tsc`, Nuxt through Vite. Full breakdown — [Architecture](/en/guide/architecture#packages-how-they-re-consumed).
