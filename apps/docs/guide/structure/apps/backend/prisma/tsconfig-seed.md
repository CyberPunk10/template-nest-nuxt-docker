# prisma/tsconfig.seed.json

Конфиг для `prisma db seed`.

```json
{
  "extends": "../tsconfig.json",
  "include": ["./seed.ts"]
}
```

Наследует [`tsconfig.json`](/guide/structure/apps/backend/tsconfig) бэкенда, поэтому получает и настройки Nest, и общие правила из [базового](/guide/structure/tsconfig-base). Своего в нём — только `include`.

## Зачем отдельный файл

Скрипт сида запускается через `ts-node`, а не через `nest build`. Команда прописана в `prisma.config.ts`:

```ts
seed: 'ts-node --transpile-only --project prisma/tsconfig.seed.json prisma/seed.ts'
```

`ts-node` требует `--project` с путём к конфигу. Файл нужен ровно для одного: указать `seed.ts` как входную точку, унаследовав всё остальное.

## Почему больше ничего не нужно

`--transpile-only` отключает проверку типов при запуске: `ts-node` только переписывает TypeScript в JavaScript и исполняет результат в памяти. На диск ничего не пишется, поэтому `noEmit: true` из базового конфига ему не мешает, а `outDir` и `rootDir` не нужны.

Проверка типов при этом не теряется — `seed.ts` попадает в `pnpm type-check` бэкенда, потому что лежит внутри `apps/backend`. Отдельной команды для него нет.

## Сгенерированный клиент Prisma

`seed.ts` импортирует клиент из `src/generated/prisma/client`:

```ts
import { PrismaClient } from '../src/generated/prisma/client'
```

Перечислять эти файлы в `include` не требуется — TypeScript находит их сам, по импорту. Каталог `src/generated/` в `.gitignore`: клиент создаётся командой `prisma generate` из [схемы](/guide/database), в репозиторий не попадает.
