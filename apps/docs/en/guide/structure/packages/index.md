# packages/

Two libraries used by the applications. They are linked as `workspace:*` — pnpm symlinks them, no registry publishing involved.

```
packages/
├── shared/      types (DTOs) and translations — for backend and frontend
└── ui/          Vue components — frontend only
```

| Package | Used by | Build |
| --- | --- | --- |
| [shared](/en/guide/structure/packages/shared/) | backend, frontend | source-only |
| [ui](/en/guide/structure/packages/ui/) | frontend | source-only |

Neither is compiled: Vite and Nest handle the sources directly through the workspace aliases. Full breakdown — [Architecture](/en/guide/architecture#packages-how-they-re-consumed).
