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
      Backend: ['NestJS', 'Joi validation', 'Swagger/OpenAPI', 'Exception filter'],
      Frontend: ['Nuxt 4', 'Vue 3', 'TypeScript'],
      Shared: ['@repo/shared', 'i18n (ru/en/th)'],
      Infra: ['Docker (multi-stage)', 'pnpm 11 workspaces'],
    },
  },
  {
    id: 'auth',
    name: 'auth-session',
    current: true,
    stack: {
      Backend: [
        'NestJS',
        'Passport.js',
        'JWT + bcrypt',
        'Swagger/OpenAPI',
      ],
      Frontend: [
        'Nuxt 4',
        'Vue 3',
        'TypeScript',
        'useAuth',
        'Route middleware',
      ],
      Shared: ['@repo/shared', 'i18n (ru/en/th)'],
      Infra: ['Docker (multi-stage)', 'pnpm 11 workspaces'],
    },
  },
  {
    id: 'postgresPrisma',
    name: 'postgres-prisma',
    current: false,
    stack: {
      Backend: ['NestJS', 'Prisma 7', '@prisma/adapter-pg', 'Joi validation', 'Swagger/OpenAPI'],
      Frontend: ['Nuxt 4', 'Vue 3', 'TypeScript'],
      Shared: ['@repo/shared', 'i18n (ru/en/th)'],
      Infra: ['Docker (multi-stage)', 'pnpm 11 workspaces', 'PostgreSQL 17'],
    },
  },
]

export const quickstarts: Quickstart[] = [
  {
    branch: 'main',
    steps: [
      {
        id: 'clone',
        cmd: 'git clone https://github.com/CyberPunk10/template-nest-nuxt-docker && git checkout main',
      },
      { id: 'install', cmd: 'pnpm install' },
      { id: 'run', cmd: 'pnpm dev' },
    ],
  },
  {
    branch: 'auth-session',
    steps: [
      {
        id: 'clone',
        cmd: 'git clone https://github.com/CyberPunk10/template-nest-nuxt-docker && git checkout auth-session',
      },
      { id: 'install', cmd: 'pnpm install' },
      {
        id: 'envCheck',
        cmd: 'cp apps/backend/.env.example apps/backend/.env',
      },
      { id: 'run', cmd: 'pnpm dev' },
    ],
  },
  {
    branch: 'postgres-prisma',
    steps: [
      {
        id: 'clone',
        cmd: 'git clone https://github.com/CyberPunk10/template-nest-nuxt-docker && git checkout postgres-prisma',
      },
      { id: 'install', cmd: 'pnpm install' },
      {
        id: 'envCheck',
        cmd: 'cp apps/backend/.env.example apps/backend/.env',
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
