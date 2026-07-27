import { BACKEND_ENV, FRONTEND_ENV, DOCS_ENV, copyEnvFiles } from './copy-env.mjs'
import { checkPorts } from './check-ports.mjs'

async function main() {
  // Шаг 1: создать .env из .env.example если отсутствует
  copyEnvFiles()

  // Шаг 2: проверить порты и разрешить конфликты
  await checkPorts([
    { name: 'backend', envPath: BACKEND_ENV, key: 'PORT' },
    { name: 'frontend', envPath: FRONTEND_ENV, key: 'PORT' },
    { name: 'docs', envPath: DOCS_ENV, key: 'PORT' },
  ])
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('predev failed:', e.message)
  process.exit(1)
})
