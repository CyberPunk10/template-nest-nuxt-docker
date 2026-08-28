import { ROOT_ENV, copyEnvFiles } from './copy-env.mjs'
import { checkPorts } from './check-ports.mjs'
import { ensureNetwork } from './ensure-network.mjs'
import { createLogger } from './log.mjs'

const log = createLogger('predocker.mjs')

async function main() {
  // Шаг 1: создать .env из .env.example если отсутствует
  copyEnvFiles()

  // Шаг 2: проверить хост-порты и разрешить конфликты.
  // Из всех сервисов проверяем только прокси: backend и frontend хост-портов
  // не занимают вовсе, а порт БД держит Docker — убить его через lsof нельзя,
  // и на уже поднятой БД проверка выдавала бы ложный конфликт.
  await checkPorts([
    { name: 'nginx', envPath: ROOT_ENV, key: 'NGINX_HOST_PORT' },
  ])

  // Шаг 3: создать Docker-сеть, если её ещё нет
  ensureNetwork()
}

main().catch((e) => {
  log.error('failed:', e.message)
  process.exit(1)
})
