import { BACKEND_ENV, FRONTEND_ENV, DOCS_ENV, copyEnvFiles } from './copy-env.mjs'
import { checkPorts } from './check-ports.mjs'
import { createLogger } from './log.mjs'
import { dbUp } from './db.mjs'

const log = createLogger('predev.mjs')

async function main() {
  // Шаг 1: создать .env из .env.example если отсутствует
  copyEnvFiles()

  // Шаг 2: проверить порты и разрешить конфликты.
  // Порт БД сюда не входит: проверка умеет только убивать процессы на хосте,
  // а этот порт держит Docker. Его занятость поймает dbUp на шаге 3.
  await checkPorts([
    { name: 'backend', envPath: BACKEND_ENV, key: 'PORT' },
    { name: 'frontend', envPath: FRONTEND_ENV, key: 'PORT' },
    { name: 'docs', envPath: DOCS_ENV, key: 'PORT' },
  ])

  // Шаг 3: поднять БД — приложения запускаются локально, но Postgres нужен
  // из Docker. Повторный запуск на уже поднятом контейнере ничего не меняет.
  dbUp()
}

main().catch((e) => {
  log.error('failed:', e.message)
  process.exit(1)
})
