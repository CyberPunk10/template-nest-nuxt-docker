# predev.mjs

Запускается автоматически перед `pnpm dev` — через npm `pre*`-конвенцию.

Делает две вещи:

1. **Копирует `.env.example` → `.env`** для всех четырёх файлов разом (корневой, `apps/backend`, `apps/frontend`, `apps/docs`) — через общую `copyEnvFiles()` из [`copy-env.mjs`](/guide/structure/scripts/copy-env).
2. **Проверяет порты и разрешает конфликты** — через общую `checkPorts()` из [`check-ports.mjs`](/guide/structure/scripts/check-ports). При конфликте предлагает диалог: убить занявший процесс или прервать запуск.

Проверяются dev-порты: `PORT` из `apps/backend/.env`, `apps/frontend/.env` и `apps/docs/.env`.

Тем же занимается [`predocker.mjs`](/guide/structure/scripts/predocker) — разница только в списке портов и в том, что он дополнительно заводит Docker-сеть.

## Использование

Запускается сам — отдельно вызывать не нужно:

```bash
pnpm dev
```

npm видит скрипт `predev` и выполняет его перед `dev`. Запустить только подготовку, без старта приложений:

```bash
pnpm predev
```
