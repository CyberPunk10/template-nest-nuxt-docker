import { ROOT_ENV, copyEnvFiles } from './copy-env.mjs'
import { checkPorts } from './check-ports.mjs'
import { ensureNetwork } from './ensure-network.mjs'

async function main() {
  // Шаг 1: создать .env из .env.example если отсутствует
  copyEnvFiles()

  // Шаг 2: проверить хост-порты и разрешить конфликты
  // Проверять нужно только порт reverse proxy: наружу публикуется он один,
  // остальные сервисы живут во внутренней сети и хост-портов не занимают.
  await checkPorts([
    { name: 'nginx', envPath: ROOT_ENV, key: 'NGINX_HOST_PORT' },
  ])

  // Шаг 3: создать Docker-сеть, если её ещё нет
  ensureNetwork()
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('predocker failed:', e.message)
  process.exit(1)
})
