# pnpm и Corepack

## Требования проекта

```json
"packageManager": "pnpm@11.27.1",
"engines": {
  "node": ">=24",
  "pnpm": ">=11",
  "npm": "please-use-pnpm"
}
```

`.npmrc` содержит `engine-strict=true` — `pnpm install` **откажется** ставить зависимости на неподходящей версии Node вместо тихой установки, которая могла бы сломаться на рантайме позже.

## Проблема: несколько установленных версий pnpm одновременно

На одной машине pnpm можно поставить как минимум тремя разными способами, и они **не знают друг о друге**:

| Способ                                       | Пример пути                                    | Управляется чем                              |
| -------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| Standalone-скрипт (`get.pnpm.io/install.sh`) | `~/.local/share/pnpm/pnpm`                     | сам себя, версия зафиксирована при установке |
| `npm install -g pnpm`                        | `~/.nvm/versions/node/vX.Y.Z/bin/pnpm`         | текущая активная nvm-версия Node             |
| Системный пакет / глобальный npm             | `/usr/bin/pnpm` → `/usr/lib/node_modules/pnpm` | системный Node, вне nvm                      |
| **Corepack**                                 | шим, подставляющий версию из `packageManager`  | `package.json` **каждого** проекта           |

Если несколько из них есть одновременно, командой `pnpm ...` в терминале выполняется **тот, что первый в `$PATH`** — не обязательно тот, что нужен текущему проекту. Standalone-установка через `~/.zshrc` (`export PATH="$PNPM_HOME:$PATH"`) специально ставит себя в начало `PATH`, поэтому перехватывает вызов раньше, чем успевает сработать Corepack-шим.

### Как это проявляется на практике

Симптом — старая версия pnpm не понимает lockfile, собранный новой версией:

```
[ERROR] Cannot use 'in' operator to search for 'integrity' in undefined
```

Или явная несовместимость с `engines.pnpm` в `package.json`:

```
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=11
Got: 8.15.5
```

Проверить, что реально вызывается:

```bash
which pnpm       # какой бинарник резолвится первым
pnpm --version   # что он на самом деле сообщает
```

Если версия не совпадает с `packageManager` в `package.json` открытого проекта — сработал один из трёх «прямых» способов установки, а не Corepack.

## Corepack — рекомендуемый способ

[Corepack](https://nodejs.org/api/corepack.html) встроен в Node.js (стабильно с v16.9+) и решает задачу иначе: не ставит pnpm глобально с фиксированной версией, а **на каждый запуск** подставляет ту версию, что указана в `packageManager` открытого проекта. Открываете проект A с `pnpm@9` — работает `9`; переходите в проект B с `pnpm@11.27.1` — работает `11.27.1`. Никакой глобальной версии, за которой нужно следить руками.

Это официально рекомендуемый способ для проектов с полем `packageManager` — без Corepack это поле превращается в текст без эффекта, версия расходится молча, и вы узнаёте об этом только когда что-то ломается.

### Основные команды

```bash
corepack enable                # включить Corepack глобально
corepack disable               # выключить

corepack use pnpm@latest       # обновить packageManager проекта на последнюю версию
corepack use pnpm@9.15.0       # закрепить конкретную версию

corepack install               # поставить версию, указанную в packageManager текущего package.json
```

`corepack use pnpm@X` не только переключает версию — он же обновляет `packageManager` в `package.json` и добавляет к ней integrity-хэш (`pnpm@11.27.1+sha512.<hash>`), которым Corepack проверяет целостность скачанного бинарника при каждой установке.

### В monorepo — поле только в корне

`packageManager` — настройка **всего workspace**, читается pnpm только из корневого `package.json`. Добавлять его в `apps/*/package.json` не нужно — pnpm его там просто игнорирует, а дублирование лишь создаёт риск забыть обновить одну из копий.

## Переход на Corepack: пошагово

Если на машине уже стоит один или несколько «прямых» способов установки — их стоит убрать по очереди, иначе Corepack продолжит быть перебит тем, что стоит раньше в `$PATH`.

### 1. Standalone-установка (`~/.local/share/pnpm`)

```bash
rm -rf ~/.local/share/pnpm
```

Затем убрать блок из `~/.zshrc` (или `~/.bashrc`) — обычно выглядит так:

```bash
# pnpm
export PNPM_HOME="/home/user/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
```

### 2. Глобальный pnpm внутри nvm-версии Node

```bash
npm uninstall -g pnpm
corepack enable
```

Если используется несколько версий Node через nvm — проверить каждую:

```bash
for d in ~/.nvm/versions/node/*/; do
  [ -d "$d/lib/node_modules/pnpm" ] && echo "$(basename "$d"): pnpm стоит глобально"
done
```

### 3. Системная установка (`/usr/bin/pnpm`)

```bash
sudo rm /usr/bin/pnpm /usr/bin/pnpx /usr/bin/pn /usr/bin/pnx
sudo rm -rf /usr/lib/node_modules/pnpm
```

### Проверка после каждого шага

```bash
which pnpm       # путь должен вести через corepack-шим
pnpm --version   # должна совпасть с packageManager в package.json
```

Повторять шаги 1–3 по очереди, перепроверяя `which pnpm` после каждого — так сразу видно, какой из способов перехватывал команду следующим.

## Corepack в Docker

Базовые Node-образы (`node:24-alpine` и т.д.) включают Corepack в комплекте, но в новых версиях Node он не активирован по умолчанию — нужно явно включить в `Dockerfile`:

```dockerfile
FROM node:24-alpine
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

**Не фиксировать версию pnpm в `Dockerfile` вручную** (`RUN npm install -g pnpm@X.Y.Z`) — это создаёт ту же рассинхронизацию, что и на локальной машине: версия в образе может тихо разойтись с `packageManager` проекта. `corepack enable` + `packageManager` в `package.json` должны оставаться единственным источником правды — тогда версия в контейнере автоматически совпадает с версией у разработчиков.

