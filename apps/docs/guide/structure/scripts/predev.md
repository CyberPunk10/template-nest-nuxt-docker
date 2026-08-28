# predev.mjs

Запускается автоматически перед `pnpm dev` — через npm `pre*`-конвенцию.

Делает три вещи:

1. **Копирует `.env.example` → `.env`** для всех четырёх файлов разом (корневой, `apps/backend`, `apps/frontend`, `apps/docs`) — через общую `copyEnvFiles()` из [`copy-env.mjs`](/guide/structure/scripts/copy-env).
2. **Проверяет порты и разрешает конфликты** — через общую `checkPorts()` из [`check-ports.mjs`](/guide/structure/scripts/check-ports). При конфликте предлагает диалог: убить занявший процесс или прервать запуск.
3. **Поднимает БД** — через `dbUp()` из [`db.mjs`](/guide/structure/scripts/db). Приложения при `pnpm dev` работают локально, но Postgres нужен из Docker. Повторный вызов на уже поднятом контейнере ничего не меняет.

Проверяются dev-порты: `PORT` из `apps/backend/.env`, `apps/frontend/.env` и `apps/docs/.env`.

Порт БД в список не входит: проверка умеет только убивать процессы на хосте, а этот порт держит Docker. Его занятость поймает шаг 3 — Docker скажет `address already in use`.

Тем же занимается [`predocker.mjs`](/guide/structure/scripts/predocker) — разница в списке портов и в том, что БД он не поднимает отдельно: её поднимает сам `docker compose` вместе с остальными сервисами.

## Использование

Запускается сам — отдельно вызывать не нужно:

```bash
pnpm dev
```

npm видит скрипт `predev` и выполняет его перед `dev`. Запустить только подготовку, без старта приложений:

```bash
pnpm predev
```
