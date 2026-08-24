# tsconfig.json

The shortest config in the repository — the package needs almost nothing beyond the [base one](/en/guide/structure/tsconfig-base):

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

Translations live in `src/i18n/*/*.json` and are imported directly:

```ts
import ru from './ru.json'
```

Without this option TypeScript refuses to resolve such an import. It also types the result from the file's contents — the shape of a translation is inferred automatically.

## Why nothing else is needed

The package is source-only: `main` and `types` in `package.json` point straight at `src/index.ts`, and there's no build step. The consumers — Nuxt through Vite, the backend through `nest build` — compile the sources themselves, each for its own environment.

That's why there's no `target`, no `lib`, no `outDir`: the package isn't tied to a runtime. The same code travels to both the browser and Node.

## Type checking

```bash
pnpm --filter @repo/shared type-check
```

Plain `tsc --noEmit` — the package holds only `.ts`, no Vue components.
