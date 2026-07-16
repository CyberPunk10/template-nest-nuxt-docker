import { intro, select, outro, cancel, isCancel } from '@clack/prompts'
import { BACKEND_ENV, FRONTEND_ENV, copyEnvFiles } from './copy-env.mjs'
import { isPortFree, killPort, requirePort } from './ports.mjs'

// Проверяет порты backend и frontend, при конфликте предлагает диалог
async function checkPorts() {
  const backendPort = requirePort(BACKEND_ENV, 'PORT')
  const frontendPort = requirePort(FRONTEND_ENV, 'PORT')

  const [backendFree, frontendFree] = await Promise.all([
    isPortFree(backendPort),
    isPortFree(frontendPort),
  ])

  if (backendFree && frontendFree) return

  const busyPorts = [
    !backendFree && `backend=${backendPort}`,
    !frontendFree && `frontend=${frontendPort}`,
  ].filter(Boolean).join(', ')

  intro(`Port conflict: ${busyPorts}`)

  const answer = await select({
    message: 'What would you like to do?',
    options: [
      { label: `Kill existing processes and use same ports (${backendPort}, ${frontendPort})`, value: 'kill' },
      { label: 'Abort', value: 'abort' },
    ],
  })

  if (isCancel(answer) || answer === 'abort') {
    cancel('Aborted.')
    process.exit(1)
  }

  if (!backendFree) killPort(backendPort)
  if (!frontendFree) killPort(frontendPort)
  outro('Ports freed')
}

async function main() {
  // Шаг 1: создать .env из .env.example если отсутствует
  copyEnvFiles()

  // Шаг 2: проверить порты и разрешить конфликты
  await checkPorts()
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('predev failed:', e.message)
  process.exit(1)
})
