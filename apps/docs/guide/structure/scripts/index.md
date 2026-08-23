# scripts/

Node-скрипты, которые стоят за командами из `package.json`.

```
scripts/
├── predev.mjs          перед pnpm dev: .env + порты
├── predocker.mjs       перед pnpm docker:up: .env + порт прокси + сеть
├── copy-env.mjs        пути к .env, копирование, parseEnv
├── copy-env-cli.mjs    CLI-обёртка для pnpm env:copy
├── check-ports.mjs     проверка занятости портов, диалог
├── ensure-network.mjs  создание Docker-сети
├── dev.mjs             параллельный запуск трёх приложений
└── reinstall.mjs       переустановка зависимостей с нуля
```
