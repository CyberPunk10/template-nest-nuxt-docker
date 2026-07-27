import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'
import { defineConfigWithTheme } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import ruLocale from './locales/ru.json'
import enLocale from './locales/en.json'
import thLocale from './locales/th.json'

// apps/docs/.env не грузится автоматически (в отличие от Nest ConfigModule
// и Nuxt) — читаем его явно, чтобы PORT управлял портом `vitepress dev` так же,
// как для backend/frontend.
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') })

// Расширяем тему дефолтной + переводы стартовой страницы в themeConfig.home.
// VitePress отдаёт их через useData().theme реактивно к локали — вместо vue-i18n.
// Переводы лежат в locales/*.json (единый источник для витрины и config).
interface ThemeConfig extends DefaultTheme.Config {
  home?: typeof ruLocale.home
}

export default defineConfigWithTheme<ThemeConfig>({
  base: '/',
  title: 'NestJS + Nuxt Template',
  description: 'Документация монорепо-шаблона',

  // В доках много ссылок вида http://localhost:3100/3200/5173 —
  // VitePress по умолчанию считает их dead links при сборке,
  // т.к. localhost гарантированно недостижим со стороны собранного сайта.
  // 'localhostLinks' — встроенный режим именно под этот случай: точечно
  // разрешает //localhost:*, не отключая проверку остальных ссылок целиком.
  ignoreDeadLinks: 'localhostLinks',

  vite: {
    server: {
      // 5173 — дефолт самого Vite, используется если PORT не задан в apps/docs/.env
      port: Number(process.env.PORT) || 5173,
    },
  },

  // Общие для всех локалей настройки темы (переопределяются в locales.*).
  themeConfig: {
    // Убираем нижнюю навигацию «предыдущая/следующая» — лишний шум для линейного чтения.
    docFooter: { prev: false, next: false },

    // Ссылка на репозиторий — штатная иконка в шапке (общая для всех локалей).
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CyberPunk10/template-nest-nuxt-docker' },
    ],
  },

  // Мультиязычность: root = русский (в корне), en/th — в папках-локалях.
  // VitePress сам добавляет переключатель языка в шапку и класс lang на <html>.
  locales: {
    root: {
      label: 'Русский',
      lang: 'ru',
      themeConfig: {
        outline: { level: 'deep', label: 'На странице' },
        // Переводы стартовой страницы. Кладём в themeConfig — VitePress отдаёт
        // их через useData().theme, реактивно к локали. Заменяет vue-i18n.
        home: ruLocale.home,
        sidebar: [
          {
            text: 'Документация',
            items: [
              { text: 'Запуск проекта', link: '/guide/getting-started' },
              { text: 'Архитектура', link: '/guide/architecture' },
              { text: 'База данных', link: '/guide/database' },
              { text: 'Переменные окружения', link: '/guide/env-variables' },
              { text: 'Docker', link: '/guide/docker' },
              { text: 'Скрипты', link: '/guide/scripts' },
            ],
          },
          {
            text: 'Дополнительная информация',
            items: [
              { text: 'pnpm и Corepack', link: '/guide/pnpm' },
            ],
          },
          {
            text: 'Примеры',
            items: [
              { text: 'Markdown', link: '/markdown-examples' },
              { text: 'Runtime API', link: '/api-examples' },
            ],
          },
        ],
        docFooter: {
          prev: 'Предыдущая страница',
          next: 'Следующая страница',
        },
        returnToTopLabel: 'Наверх',
        darkModeSwitchLabel: 'Тема',
        sidebarMenuLabel: 'Меню',
      },
    },

    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        outline: { level: 'deep', label: 'On this page' },
        home: enLocale.home,
        sidebar: [
          {
            text: 'Documentation',
            items: [
              { text: 'Getting Started', link: '/en/guide/getting-started' },
              { text: 'Architecture', link: '/en/guide/architecture' },
              { text: 'Database', link: '/en/guide/database' },
              { text: 'Environment variables', link: '/en/guide/env-variables' },
              { text: 'Docker', link: '/en/guide/docker' },
              { text: 'Scripts', link: '/en/guide/scripts' },
            ],
          },
          {
            text: 'Additional Information',
            items: [
              { text: 'pnpm and Corepack', link: '/en/guide/pnpm' },
            ],
          },
          {
            text: 'Examples',
            items: [
              { text: 'Markdown Examples', link: '/en/markdown-examples' },
              { text: 'Runtime API Examples', link: '/en/api-examples' },
            ],
          },
        ],
        docFooter: {
          prev: 'Previous page',
          next: 'Next page',
        },
        returnToTopLabel: 'Return to top',
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Menu',
      },
    },

    th: {
      label: 'ไทย',
      lang: 'th',
      themeConfig: {
        outline: { level: 'deep', label: 'ในหน้านี้' },
        home: thLocale.home,
        sidebar: [
          {
            text: 'เอกสาร',
            items: [
              { text: 'เริ่มต้นใช้งาน', link: '/th/guide/getting-started' },
              { text: 'สถาปัตยกรรม', link: '/th/guide/architecture' },
              { text: 'ฐานข้อมูล', link: '/th/guide/database' },
              { text: 'ตัวแปรสภาพแวดล้อม', link: '/th/guide/env-variables' },
              { text: 'Docker', link: '/th/guide/docker' },
              { text: 'สคริปต์', link: '/th/guide/scripts' },
            ],
          },
          {
            text: 'ข้อมูลเพิ่มเติม',
            items: [
              { text: 'pnpm และ Corepack', link: '/th/guide/pnpm' },
            ],
          },
          {
            text: 'ตัวอย่าง',
            items: [
              { text: 'Markdown', link: '/th/markdown-examples' },
              { text: 'Runtime API', link: '/th/api-examples' },
            ],
          },
        ],
        docFooter: {
          prev: 'หน้าก่อนหน้า',
          next: 'หน้าถัดไป',
        },
        returnToTopLabel: 'กลับขึ้นด้านบน',
        darkModeSwitchLabel: 'ธีม',
        sidebarMenuLabel: 'เมนู',
      },
    },
  },
})
