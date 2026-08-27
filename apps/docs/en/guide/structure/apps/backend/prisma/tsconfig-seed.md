# prisma/tsconfig.seed.json

The config for `prisma db seed`.

```json
{
  "extends": "../tsconfig.json",
  "include": ["./seed.ts"]
}
```

Extends the backend's [`tsconfig.json`](/en/guide/structure/apps/backend/tsconfig), so it inherits both the Nest settings and the shared rules from the [base config](/en/guide/structure/tsconfig-base). All it adds is `include`.

## Why a separate file

The seed script runs through `ts-node`, not `nest build`. The command lives in `prisma.config.ts`:

```ts
seed: 'ts-node --transpile-only --project prisma/tsconfig.seed.json prisma/seed.ts'
```

`ts-node` needs `--project` pointing at a config. The file exists for exactly one purpose: naming `seed.ts` as the entry point and inheriting everything else.

## Why nothing else is needed

`--transpile-only` turns off type checking at run time: `ts-node` merely rewrites TypeScript into JavaScript and executes the result in memory. Nothing is written to disk, so `noEmit: true` from the base config does not get in the way, and neither `outDir` nor `rootDir` is required.

Type checking is not lost either — `seed.ts` is covered by the backend's `pnpm type-check`, because it sits inside `apps/backend`. There is no separate command for it.

## The generated Prisma client

`seed.ts` imports the client from `src/generated/prisma/client`:

```ts
import { PrismaClient } from '../src/generated/prisma/client'
```

Those files need not be listed in `include` — TypeScript finds them on its own, following the import. The `src/generated/` directory is gitignored: the client is produced by `prisma generate` from the [schema](/en/guide/database) and never enters the repository.
