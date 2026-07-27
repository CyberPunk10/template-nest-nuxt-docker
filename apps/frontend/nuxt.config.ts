// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootPkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'))
const appVersion = rootPkg.version ?? '0.0.0'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    [
      '@nuxtjs/color-mode',
      {
        preference: 'dark',
        fallback: 'dark',
      },
    ],
  ],
  devtools: { enabled: true },
  css: [
    '~/assets/css/reset.css',
    '~/assets/css/_scrollbar.scss',
    '~/assets/css/variables.css',
    '~/assets/css/variables.layout.css',
    '~/assets/css/variables.dark.css',
    '~/assets/css/variables.dark-slate.css',
    '~/assets/css/variables.dark-midnight.css',
    '~/assets/css/variables.dark-ocean.css',
    '~/assets/css/variables.dark-nuxt.css',
    '~/assets/css/variables.light.css',
    '~/assets/css/variables.light-sand.css',
    '~/assets/css/variables.light-mist.css',
    '~/assets/css/variables.light-rose.css',
    '~/assets/css/_tippy.scss',
  ],

  runtimeConfig: {
    // Серверная переменная — недоступна на клиенте.
    // Переопределяется через NUXT_BACKEND_URL в .env
    backendUrl: 'http://localhost:3100',

    public: {
      // Переопределяется через NUXT_PUBLIC_API_BASE
      apiBase: '/api/backend',

      // Только для отображения ссылки в DevPanel — НЕ использовать для fetch,
      // это просто число порта, а не готовый URL. Реальные запросы к backend
      // идут через apiBase (server-side proxy, см. server/api/backend/[...path].ts),
      // который использует отдельную серверную переменную BACKEND_URL.
      // Переопределяется через NUXT_PUBLIC_BACKEND_PORT
      backendPort: '3100',

      // Адрес VitePress-документации. Dev — отдельный порт, prod — подпуть /docs.
      // Переопределяется через NUXT_PUBLIC_DOCS_URL
      docsUrl: 'http://localhost:5173',

      // Переопределяется через NUXT_PUBLIC_APP_ENV
      appEnv: 'development',

      // версия приложения для наглядности в интерфейсе
      appVersion,
    },
  },

  compatibilityDate: '2025-07-15',

  vite: {
    optimizeDeps: {
      include: [
        '@vueuse/core',
        'mitt',
        'vue-tippy',
      ],
    },
  },

  eslint: {
    config: {
      stylistic: {
        semi: false,
        quotes: 'single',
        indent: 2,
      },
    },
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', language: 'ru-RU' },
      { code: 'en', language: 'en-US' },
      { code: 'th', language: 'th-TH' },
    ],
  },

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },
})
