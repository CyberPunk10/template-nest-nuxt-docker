import { copyEnvFiles } from './copy-env.mjs'

const force = process.argv.includes('--force')

copyEnvFiles(force)
