import { rmSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createLogger } from './log.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const log = createLogger('reinstall.mjs')

function remove(name, path) {
  if (existsSync(path)) {
    log.log(`Removing ${name}...`)
    rmSync(path, { recursive: true, force: true })
  }
}

remove('pnpm-lock.yaml', resolve(ROOT, 'pnpm-lock.yaml'))
remove('node_modules', resolve(ROOT, 'node_modules'))

log.log('Running pnpm install...')
execSync('pnpm install', { cwd: ROOT, stdio: 'inherit' })
log.log('Done.')
