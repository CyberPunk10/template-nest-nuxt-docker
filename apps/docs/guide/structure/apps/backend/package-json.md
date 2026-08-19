# package.json

Манифест backend-приложения. Скрипты работают только внутри своего воркспейса — из корня вызываются через фильтр (`pnpm --filter backend dev`) или транзитивно из корневых команд.

| Скрипт                                          | Команда              | Что делает                                                   |
| ----------------------------------------------- | -------------------- | ------------------------------------------------------------ |
| `dev`                                           | `nest start --watch` | Локальная разработка с hot-reload                            |
| `build`                                         | `nest build`         | Production-сборка в `dist/`                                  |
| `start`                                         | `nest start`         | Запуск собранного `dist/` без watch                          |
| `start:prod`                                    | `node dist/main`     | Запуск в production-режиме (то, что использует `Dockerfile`) |
| `lint`                                          | `eslint ... --fix`   | Линтер с автофиксом                                          |
| `type-check`                                    | `tsc --noEmit`       | Проверка типов без сборки                                    |
| `test` / `test:watch` / `test:cov` / `test:e2e` | `jest ...`           | Юнит- и e2e-тесты                                            |

Что где лежит — [apps/backend](/guide/structure/apps/backend/).
