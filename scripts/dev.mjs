import { concurrently } from 'concurrently'

concurrently(
  [
    { command: 'pnpm --filter backend dev', name: 'Nest' },
    { command: 'pnpm --filter frontend dev', name: 'Nuxt' },
    { command: 'pnpm --filter docs dev', name: 'Docs' },
  ],
  {
    prefixColors: ['#e0234e', '#ffca28', '#428bb8'],
  },
)
