import { repoUrl } from './site-data'

function cloneCmd(branch: string) {
  return `git clone ${repoUrl} && git checkout ${branch}`
}

export const layers = ['Backend', 'Frontend', 'Shared', 'Infra'] as const
export type Layer = (typeof layers)[number]

export interface Branch {
  id: string // ключ в home.branches (main | auth | postgresPrisma)
  name: string
  current: boolean
  stack: Record<Layer, string[]>
}

export interface QuickstartStep {
  id: string // ключ в home.quickstart.steps
  cmd: string
}

export interface Quickstart {
  branch: string
  steps: QuickstartStep[]
}

export interface Principle {
  id: string // ключ в home.principles
  icon: string
}

export const branches: Branch[] = [
  {
    id: 'main',
    name: 'main',
    current: false,
    stack: {
      Backend: [
        'NestJS',
        'Joi validation',
        'Swagger/OpenAPI',
        'Exception filter',
      ],
      Frontend: [
        'Nuxt 4',
        'Vue 3',
        'TypeScript',
      ],
      Shared: [
        '@repo/shared',
        'i18n (ru/en/th)',
      ],
      Infra: [
        'Docker (multi-stage)',
        'pnpm 11 workspaces',
      ],
    },
  },
  {
    id: 'auth',
    name: 'auth-session',
    current: true,
    stack: {
      Backend: [
        'Passport.js',
        'JWT + bcrypt',
      ],
      Frontend: [],
      Shared: [],
      Infra: [],
    },
  },
  {
    id: 'postgresPrisma',
    name: 'postgres-prisma',
    current: false,
    stack: {
      Backend: [
        'Prisma 7',
        '@prisma/adapter-pg',
      ],
      Frontend: [],
      Shared: [],
      Infra: [
        'PostgreSQL 17',
      ],
    },
  },
]

export const quickstarts: Quickstart[] = [
  {
    branch: 'main',
    steps: [
      { id: 'clone', cmd: cloneCmd('main') },
      { id: 'install', cmd: 'pnpm install' },
      { id: 'run', cmd: 'pnpm dev' },
    ],
  },
  {
    branch: 'auth-session',
    steps: [
      { id: 'clone', cmd: cloneCmd('auth-session') },
      { id: 'install', cmd: 'pnpm install' },
      {
        id: 'envCheck',
        cmd: 'pnpm env:copy',
      },
      { id: 'run', cmd: 'pnpm dev' },
    ],
  },
  {
    branch: 'postgres-prisma',
    steps: [
      { id: 'clone', cmd: cloneCmd('postgres-prisma') },
      { id: 'install', cmd: 'pnpm install' },
      {
        id: 'envCheck',
        cmd: 'pnpm env:copy',
      },
      {
        id: 'network',
        cmd: 'docker network create template-nest-nuxt_app',
      },
      {
        id: 'postgres',
        cmd: 'docker compose -f docker-compose.dev.yml up -d',
      },
      {
        id: 'migrate',
        cmd: 'cd apps/backend && pnpm prisma migrate dev',
      },
      { id: 'run', cmd: 'pnpm dev' },
    ],
  },
]

export const principles: Principle[] = [
  { id: 'transparency', icon: 'lucide:eye' },
  { id: 'idiomatic', icon: 'lucide:book-open' },
  { id: 'production', icon: 'lucide:zap' },
  { id: 'starter', icon: 'lucide:rocket' },
]

// ─────────────────────  Витрина стека (логотипы)  ─────────────────────

export interface StackLogo {
  id: string // ключ в home.showcase.items (подпись под логотипом)
  /** Фирменный цвет технологии. Используется для логотипа и подсветки при hover. */
  color: string
  /** Ветка, начиная с которой технология присутствует. Показывается меткой на карточке. */
  branch?: string
}

/**
 * Порядок намеренный: сначала два фреймворка-героя (Nest, Nuxt), затем язык
 * и рантайм-слой, в конце — инфраструктура. Логотипы рисует StackLogo.vue
 * (inline-SVG, без внешних CDN — доки собираются в статику и раздаются nginx).
 */
export const stackLogos: StackLogo[] = [
  { id: 'nest', color: '#e0234e' },
  { id: 'nuxt', color: '#00dc82' },
  { id: 'vue', color: '#42b883' },
  { id: 'typescript', color: '#3178c6' },
  { id: 'prisma', color: '#5a67d8', branch: 'postgres-prisma' },
  { id: 'postgres', color: '#4169e1', branch: 'postgres-prisma' },
  { id: 'docker', color: '#2496ed' },
  { id: 'pnpm', color: '#f9ad00' },
]

// ────────────────────  Кому подходит / не подходит  ────────────────────

export type FitVerdict = 'good' | 'bad' | 'mixed'

export interface FitCase {
  id: string // ключ в home.fit.cases
  verdict: FitVerdict
  icon: string
}

/**
 * Честный разбор применимости шаблона. Смешанный порядок (не все «за», потом
 * все «против») — намеренно: так секция читается как разбор, а не как реклама
 * с дисклеймером в конце.
 */
export const fitCases: FitCase[] = [
  { id: 'saas', verdict: 'good', icon: 'lucide:layout-dashboard' },
  { id: 'admin', verdict: 'good', icon: 'lucide:table' },
  { id: 'landing', verdict: 'bad', icon: 'lucide:megaphone' },
  { id: 'mobileBackend', verdict: 'good', icon: 'lucide:smartphone' },
  { id: 'contentSite', verdict: 'bad', icon: 'lucide:newspaper' },
  { id: 'mvp', verdict: 'good', icon: 'lucide:rocket' },
  { id: 'microservices', verdict: 'mixed', icon: 'lucide:boxes' },
  { id: 'serverless', verdict: 'bad', icon: 'lucide:cloud-off' },
  { id: 'learning', verdict: 'good', icon: 'lucide:graduation-cap' },
  { id: 'highLoad', verdict: 'mixed', icon: 'lucide:gauge' },
  { id: 'legacy', verdict: 'bad', icon: 'lucide:file-clock' },
  { id: 'internalTools', verdict: 'good', icon: 'lucide:wrench' },
]
