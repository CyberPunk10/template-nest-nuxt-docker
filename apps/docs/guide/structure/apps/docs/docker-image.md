# apps/docs

Собирает статику VitePress в `.vitepress/dist` — и на этом останавливается. `CMD` в образе нет, своего сервера тоже: готовые файлы забирает reverse proxy на этапе своей сборки и раздаёт по `/dev/docs/`.

## Как это устроено

Готовый `dist` приезжает в образ прокси build-контекстом:

```yaml
nginx:
  build:
    dockerfile: infra/nginx/Dockerfile
    additional_contexts:
      docs: service:docs-builder

docs-builder:
  build:
    dockerfile: apps/docs/Dockerfile
  scale: 0        # нужен как источник образа, контейнером не поднимается
```

В `infra/nginx/Dockerfile` это выглядит так:

```dockerfile
COPY --from=docs /app/apps/docs/.vitepress/dist /srv/docs
```

Смысл разделения: каждое приложение отвечает за свою сборку, а прокси занимается только раздачей.

`scale: 0` нужен, чтобы `docs-builder` не запускался при `docker compose up`. Compose всё равно его соберёт — он указан как build-контекст для nginx. А вот поднимать из него контейнер бессмысленно: тот сразу завершится, потому что запускать в образе нечего.


## Посмотреть результат

Отдельно контейнер не запускают — запускать нечего. Документация появляется вместе с прокси:

```bash
docker compose up -d nginx   # → http://localhost/dev/docs/
```

Для правки самих текстов Docker вообще не нужен, быстрее dev-сервер:

```bash
pnpm --filter @repo/docs dev   # → http://localhost:5173/dev/docs/
```

Проверить: [http://localhost:5173/dev/docs/](http://localhost:5173/dev/docs/)


## Собрать образ вручную

Нужно редко — например, чтобы проверить, что сборка проходит:

```bash
docker build -f apps/docs/Dockerfile -t docs-preview .
```

Запустить его не получится: контейнер завершится сразу, потому что процесса в образе нет.

Убрать после проверки:

```bash
docker rmi docs-preview
```
