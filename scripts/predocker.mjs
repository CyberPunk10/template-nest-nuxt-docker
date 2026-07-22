import { ROOT_ENV, copyEnvFiles } from './copy-env.mjs'
import { checkPorts } from './check-ports.mjs'

async function main() {
  // Шаг 1: создать .env из .env.example если отсутствует
  copyEnvFiles()

  // Шаг 2: проверить хост-порты и разрешить конфликты
  await checkPorts([
    { name: 'backend', envPath: ROOT_ENV, key: 'BACKEND_HOST_PORT' },
    { name: 'frontend', envPath: ROOT_ENV, key: 'FRONTEND_HOST_PORT' },
    { name: 'docs', envPath: ROOT_ENV, key: 'DOCS_HOST_PORT' },
  ])
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('predocker failed:', e.message)
  process.exit(1)
})
