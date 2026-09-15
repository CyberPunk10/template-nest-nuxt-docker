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

      // Переопределяется через NUXT_PUBLIC_APP_ENV
      appEnv: 'development',

      // Ссылка на VitePress-документацию (пункт меню, DevPanel).
      // Абсолютный URL — значение для локального dev, где доки поднимаются
      // отдельным процессом (`pnpm dev`) и прокси нет. Путь /dev/docs/ в конце
      // обязателен: base доков задан как '/dev/docs/', в корне 5173 сайта нет.
      // В Docker переопределяется на относительный /dev/docs/ через
      // NUXT_PUBLIC_DOCS_URL — там всё приходит на общий reverse proxy.
      docsUrl: 'http://localhost:5173/dev/docs/',

      // версия приложения для наглядности в интерфейсе
      appVersion,
    },
  },

  compatibilityDate: '2025-07-15',

  vite: {
    css: {
      preprocessorOptions: {
        // миксины медиазапросов доступны во всех <style lang="scss"> без импорта
        scss: { additionalData: '@use "~/assets/css/breakpoints" as *;' },
      },
    },

    optimizeDeps: {
      include: [
        '@vueuse/core',
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
    clientBundle: {
      // иконки встраиваются в клиентский бандл: иначе каждая догружается
      // отдельным запросом к /api/_nuxt_icon уже после гидратации
      scan: {
        // к дефолтным шаблонам добавлен ts: имена иконок задаются не только
        // в разметке, но и в конфигах меню (sidebar-menu.ts, user-menu.ts, icons.ts)
        globInclude: ['**/*.{vue,jsx,tsx,ts,md,mdc,mdx,yml,yaml}'],
      },
    },
  },
})
