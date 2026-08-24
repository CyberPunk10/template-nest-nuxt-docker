# tsconfig.json

Проверка типов бэкенда — то, что видит IDE и что запускает `pnpm type-check`. Сборкой занимается [`tsconfig.build.json`](/guide/structure/apps/backend/tsconfig-build), он наследует этот файл.

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

Всё остальное — `strict`, `skipLibCheck`, `noEmit` — приходит из [базового конфига](/guide/structure/tsconfig-base).

## Почему commonjs

NestJS полагается на декораторы: `@Module`, `@Controller`, `@Injectable`. Внедрение зависимостей работает благодаря метаданным о типах, которые генерирует `emitDecoratorMetadata` — а он несовместим с нативными ESM-модулями.

Поэтому три опции идут вместе:

| Опция | Что делает |
| --- | --- |
| `module: commonjs` | Формат модулей, с которым работает Nest |
| `experimentalDecorators` | Включает синтаксис декораторов |
| `emitDecoratorMetadata` | Сохраняет типы параметров в рантайм — из них DI понимает, что внедрять |

Базовый конфиг задаёт `module: ESNext`, здесь он переопределён.

## Почему ES2023

Приложение запускается на Node 24 — значит доступно всё, что поддерживает V8 этой версии. Понижать `target` смысла нет: код не идёт в браузер, и транспиляция только раздула бы результат.

## types: jest и node

Без явного списка TypeScript подключает все пакеты из `node_modules/@types`, включая ненужные. Здесь указаны два:

- **`jest`** — глобалы `describe`, `it`, `expect`. Без него спеки подсвечиваются ошибкой `Cannot find name 'describe'`.
- **`node`** — `process`, `Buffer`, `__dirname` и остальное серверное окружение.

## Почему в include есть test

```json
"include": ["src", "test"]
```

`test/` содержит e2e-спеки. Без этой строки они остались бы вне проекта: IDE не видела бы глобалы jest, а `pnpm type-check` молча пропускал бы файлы целиком — ошибки типов в тестах обнаруживались бы только при запуске.

На сборку это не влияет: `tsconfig.build.json` исключает `test` отдельно.
