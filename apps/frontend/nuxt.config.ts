// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootPkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'))
const appVersion = rootPkg.version ?? '0.0.0'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/reset.css',
    '~/assets/css/_scrollbar.scss',
    '~/assets/css/variables.css',
    '~/assets/css/variables.layout.css',
    '~/assets/css/variables.dark.css',
    '~/assets/css/variables.dark-green.css',
    '~/assets/css/variables.dark-midnight.css',
    '~/assets/css/variables.dark-ocean.css',
    '~/assets/css/variables.light.css',
  ],

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },

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

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', language: 'ru-RU' },
      { code: 'en', language: 'en-US' },
      { code: 'th', language: 'th-TH' },
    ],
  },

  runtimeConfig: {
    // Серверная переменная — недоступна на клиенте.
    // Переопределяется через NUXT_BACKEND_URL в .env
    backendUrl: 'http://localhost:3001',
    public: {
      // Переопределяется через NUXT_PUBLIC_API_BASE
      apiBase: '/api/backend',
      // Переопределяется через NUXT_PUBLIC_BACKEND_URL
      backendUrl: 'http://localhost:3001',
      // Переопределяется через NUXT_PUBLIC_APP_ENV
      appEnv: 'development',
      appVersion, // версия приложения для наглядности в интерфейсе
    },
  },
})
