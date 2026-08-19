import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const ROOT_ENV = resolve(ROOT, '.env')
export const ROOT_ENV_EXAMPLE = resolve(ROOT, '.env.example')

export const BACKEND_ENV = resolve(ROOT, 'apps/backend/.env')
export const BACKEND_ENV_EXAMPLE = resolve(ROOT, 'apps/backend/.env.example')

export const FRONTEND_ENV = resolve(ROOT, 'apps/frontend/.env')
export const FRONTEND_ENV_EXAMPLE = resolve(ROOT, 'apps/frontend/.env.example')

export const DOCS_ENV = resolve(ROOT, 'apps/docs/.env')
export const DOCS_ENV_EXAMPLE = resolve(ROOT, 'apps/docs/.env.example')

// Парсит .env файл в объект { KEY: 'value' }
export function parseEnv(filePath) {
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

// Копирует .env.example → .env. Без force пропускает существующие .env.
function copyEnvExample(envPath, examplePath, force) {
  if ((force || !existsSync(envPath)) && existsSync(examplePath)) {
    writeFileSync(envPath, readFileSync(examplePath, 'utf8'))
  }
}

// Создаёт .env из .env.example для всех приложений.
// force=true перезаписывает уже существующие .env.
export function copyEnvFiles(force = false) {
  copyEnvExample(ROOT_ENV, ROOT_ENV_EXAMPLE, force)
  copyEnvExample(BACKEND_ENV, BACKEND_ENV_EXAMPLE, force)
  copyEnvExample(FRONTEND_ENV, FRONTEND_ENV_EXAMPLE, force)
  copyEnvExample(DOCS_ENV, DOCS_ENV_EXAMPLE, force)
}
