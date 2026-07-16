import { createServer } from 'net'
import { readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'

// Парсит .env файл в объект { KEY: 'value' }
function parseEnv(filePath) {
  if (!existsSync(filePath)) return {}
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const idx = l.indexOf('=')
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
      }),
  )
}

// Проверяет, свободен ли порт
export function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen(port, '127.0.0.1')
  })
}

// Завершает процессы на указанном порту (только macOS/Linux — использует lsof)
export function killPort(port) {
  try {
    const pids = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: 'utf8' }).trim()
    if (pids) {
      pids.split('\n').forEach((pid) => {
        try {
          execSync(`kill ${pid}`)
        } catch {
          // процесс уже мог завершиться сам — не критично
        }
      })
      return true
    }
  } catch {
    // lsof недоступен или порт никем не занят — считаем порт свободным
  }
  return false
}

// Читает обязательную переменную порта из .env, при отсутствии или некорректном значении — падает с понятной ошибкой
export function requirePort(envPath, key) {
  const env = parseEnv(envPath)
  if (!(key in env)) {
    throw new Error(`${key} не задан в ${envPath} — проверьте .env.example рядом с ним`)
  }
  const port = Number(env[key])
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`${key}=${env[key]} в ${envPath} — не корректный номер порта (0-65535)`)
  }
  return port
}
