# log.mjs

Помечает префиксом собственные сообщения скриптов из `scripts/`.

```js
import { createLogger } from './log.mjs'

const log = createLogger('predev.mjs')

log.log('Ports checked')          // [predev.mjs] Ports checked
log.error('failed:', e.message)   // [predev.mjs] failed: ...
```

## Зачем

Скрипты запускают `docker compose`, `pnpm install` и `concurrently`, и вывод этих команд идёт в тот же терминал. Без пометки собственные строки в общем потоке теряются.

Формат намеренно повторяет префиксы `concurrently` (`[Nest]`, `[Nuxt]`), но берёт свой цвет — пурпурный для обычных сообщений, красный для ошибок. Красный, жёлтый и голубой заняты самим `concurrently`, см. [dev.mjs](/guide/structure/scripts/dev).

## Когда цвет не выводится

Escape-коды пишутся, только когда вывод идёт в терминал. При перенаправлении в файл или в CI они превратились бы в мусор вида `ESC[35m`, поэтому проверяется `process.stdout.isTTY`. Переменная `NO_COLOR` отключает цвет принудительно — это общепринятое соглашение.

```bash
pnpm docker:up                 # префикс с цветом
pnpm docker:up > log.txt       # без escape-кодов
NO_COLOR=1 pnpm docker:up      # то же самое принудительно
```

