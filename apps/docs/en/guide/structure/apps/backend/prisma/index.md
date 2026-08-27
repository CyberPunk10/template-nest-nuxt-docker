# apps/backend/prisma

Everything related to the database schema and its lifecycle.

```
prisma/
├── schema.prisma           models, relations, enums
├── migrations/             history of schema changes
│   ├── 20260813204454_init/
│   └── migration_lock.toml
├── seed.ts                 filling the database with initial data
└── tsconfig.seed.json      TypeScript config for running seed.ts
```

The directory is read by the Prisma CLI; its path is set in the backend's `prisma.config.ts`. The generated client does not land here — it is created in `src/generated/prisma/` and is not versioned.

How to use all of this — migrations, client generation, seeding — is covered in [Database](/en/guide/database).

[`tsconfig.seed.json`](/en/guide/structure/apps/backend/prisma/tsconfig-seed) has a page of its own — it is the config that lets `ts-node` run `seed.ts`.
