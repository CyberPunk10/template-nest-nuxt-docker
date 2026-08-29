// Сеть в docker-compose.yml объявлена как external — Compose её не создаёт.
// Этот модуль снимает ручной шаг `docker network create` перед первым запуском.

import { execFileSync } from 'child_process'
import { ROOT_ENV, parseEnv } from './copy-env.mjs'
import { createLogger } from './log.mjs'

const log = createLogger('ensure-network.mjs')

function getNetworkName() {
  const key = 'COMPOSE_NETWORK_NAME'
  const value = parseEnv(ROOT_ENV)[key]

  if (!value) {
    throw new Error(`${key} not set in ${ROOT_ENV} - check .env.example next to it`)
  }
  return value
}

// Проверяет, существует ли сеть с таким именем
function networkExists(name) {
  try {
    // Фильтр name= ищет по подстроке, поэтому сверяем совпадение сами
    const found = execFileSync(
      'docker',
      ['network', 'ls', '--filter', `name=${name}`, '--format', '{{.Name}}'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
    return found.split('\n').some(line => line.trim() === name)
  } catch {
    // docker недоступен — дальше `docker compose` упадёт с понятной ошибкой
    return false
  }
}

// Создаёт сеть, если её ещё нет. Возвращает true, если сеть была создана
export function ensureNetwork() {
  const name = getNetworkName()
  if (networkExists(name)) return false
  execFileSync(
    'docker',
    ['network', 'create', name],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  log.log(`Created Docker network ${name}`)
  return true
}
