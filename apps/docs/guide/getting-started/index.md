# Запуск проекта

## Быстрый старт

Нужны [Node.js ≥ 24 и pnpm](/guide/getting-started/setup) — остальное скрипт сделает сам:

```bash
git clone git@github.com:CyberPunk10/template-nest-nuxt-docker.git
cd template-nest-nuxt-docker
pnpm install
pnpm dev
```

Откроется на [http://localhost:3200](http://localhost:3200). Всё остальное на этой странице — про то, чем этот режим отличается от Docker и что настроить, если что-то не завелось.

## Два режима

Два способа запустить проект, у каждого своё назначение:

|                                        | Для чего                                                              |
| -------------------------------------- | ---------------------------------------------------------------------- |
| [**pnpm**](/guide/getting-started/run-pnpm)            | Повседневная разработка: hot-reload, быстрый старт, без контейнеров   |
| [**Docker**](/guide/getting-started/run-docker)        | Репетиция продакшена: те же образы и та же схема, что уедут в деплой  |

Оба режима используют одни и те же приложения и различаются только тем, как до них добираться: в pnpm каждое слушает свой порт, в Docker всё приходит на reverse proxy.

## С чего начать

1. [Подготовка](/guide/getting-started/setup) — Node.js, pnpm, Docker, `.env`-файлы
2. [Запуск через pnpm](/guide/getting-started/run-pnpm) или [через Docker](/guide/getting-started/run-docker)

## Разница режимов

| Что          | pnpm dev                          | Docker                       |
| ------------ | --------------------------------- | ---------------------------- |
| Приложение   | `http://localhost:3200`           | `http://localhost/`          |
| Документация | `http://localhost:5173/dev/docs/` | `http://localhost/dev/docs/` |
| Swagger      | `http://localhost:3100/api/docs`  | `http://localhost/api/docs`  |
| Hot-reload   | есть                              | нет                          |
| Reverse proxy | нет                              | есть                         |

Пути совпадают, различается только хост с портом — адреса вынесены в переменные окружения, чтобы код о них не знал.
