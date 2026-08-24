# tsconfig.json

Type checking for the backend — what the IDE sees and what `pnpm type-check` runs. Building is handled by [`tsconfig.build.json`](/en/guide/structure/apps/backend/tsconfig-build), which extends this file.

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "ES2023",
    "types": ["jest", "node"]
  },
  "include": ["src", "test"]
}
```

Everything else — `strict`, `skipLibCheck`, `noEmit` — comes from the [base config](/en/guide/structure/tsconfig-base).

## Why commonjs

NestJS relies on decorators: `@Module`, `@Controller`, `@Injectable`. Dependency injection works thanks to the type metadata `emitDecoratorMetadata` generates — and that flag is incompatible with native ESM modules.

So three options travel together:

| Option | What it does |
| --- | --- |
| `module: commonjs` | The module format Nest works with |
| `experimentalDecorators` | Enables decorator syntax |
| `emitDecoratorMetadata` | Keeps parameter types at runtime — DI reads them to know what to inject |

The base config sets `module: ESNext`; it's overridden here.

## Why ES2023

The app runs on Node 24, so everything that version's V8 supports is available. Lowering `target` would serve no purpose: the code never reaches a browser, and transpiling would only bloat the output.

## types: jest and node

Without an explicit list, TypeScript pulls in every package under `node_modules/@types`, including irrelevant ones. Two are named here:

- **`jest`** — the `describe`, `it`, `expect` globals. Without it specs are flagged with `Cannot find name 'describe'`.
- **`node`** — `process`, `Buffer`, `__dirname` and the rest of the server environment.

## Why include covers test

```json
"include": ["src", "test"]
```

`test/` holds the e2e specs. Without this line they'd sit outside the project: the IDE wouldn't see the jest globals, and `pnpm type-check` would silently skip the files entirely — type errors in tests would only surface at run time.

The build isn't affected: `tsconfig.build.json` excludes `test` separately.
