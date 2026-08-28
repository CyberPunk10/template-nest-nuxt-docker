# predocker.mjs

Запускается автоматически перед `pnpm docker:up` — через npm `pre*`-конвенцию.

Делает три вещи:

1. **Копирует `.env.example` → `.env`** для всех четырёх файлов разом (корневой, `apps/backend`, `apps/frontend`, `apps/docs`) — через общую `copyEnvFiles()` из [`copy-env.mjs`](/guide/structure/scripts/copy-env).
2. **Проверяет порт и разрешает конфликты** — через общую `checkPorts()` из [`check-ports.mjs`](/guide/structure/scripts/check-ports). При конфликте предлагает диалог: убить занявший процесс или прервать запуск.
3. **Создаёт Docker-сеть**, если её ещё нет — через [`ensure-network.mjs`](/guide/structure/scripts/ensure-network). Имя берётся из `COMPOSE_NETWORK_NAME` в корневом `.env` — оттуда же его читает `docker-compose.yml`. Повторные запуски ничего не делают.

Проверяется единственный порт — `NGINX_HOST_PORT` из корневого `.env`. Backend и frontend хост-портов не занимают вовсе: они живут во внутренней сети. Порт БД наружу публикуется, но в проверку не входит — его держит Docker, и на уже поднятой БД это был бы ложный конфликт.

::: warning
Это срабатывает только перед `pnpm docker:up`, не перед прямым `docker compose up`. Если вызвать `docker compose up` напрямую, минуя npm-обёртку, на свежем клоне без `.env` — команда откажется стартовать: у переменных портов в `docker-compose.yml` нет дефолтов (`no port specified` без корневого `.env`), а `env_file` для `apps/*/.env` обязателен по умолчанию (`env file ... not found`). Никакой явной проверки занятости портов тоже не будет — если хост-порт занят, будет обычная Docker-ошибка `address already in use`, без диалога с предложением освободить порт. Создать недостающие `.env` заранее, не запуская ничего: `pnpm env:copy`.
:::

Аналог для локальной разработки — [`predev.mjs`](/guide/structure/scripts/predev).

## Использование

Запускается сам — отдельно вызывать не нужно:

```bash
pnpm docker:up
```

npm видит скрипт `predocker:up` и выполняет его перед `docker:up`. Запустить только подготовку, без старта контейнеров:

```bash
pnpm predocker:up
```
