import { defineConfigWithTheme } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import ruLocale from './locales/ru.json'
import enLocale from './locales/en.json'
import thLocale from './locales/th.json'

// Расширяем тему дефолтной + переводы стартовой страницы в themeConfig.home.
// VitePress отдаёт их через useData().theme реактивно к локали — вместо vue-i18n.
// Переводы лежат в locales/*.json (единый источник для витрины и config).
interface ThemeConfig extends DefaultTheme.Config {
  home?: typeof ruLocale.home
}

export default defineConfigWithTheme<ThemeConfig>({
  // В проде документация отдаётся под подпутём /docs (за reverse-proxy).
  base: '/docs/',
  title: 'NestJS + Nuxt Template',
  description: 'Документация монорепо-шаблона',

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
              { text: 'Разработка', link: '/guide/development' },
              { text: 'Архитектура', link: '/guide/architecture' },
              { text: 'База данных', link: '/guide/database' },
              { text: 'Переменные окружения', link: '/guide/env-variables' },
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
              { text: 'Development', link: '/en/guide/development' },
              { text: 'Architecture', link: '/en/guide/architecture' },
              { text: 'Database', link: '/en/guide/database' },
              { text: 'Environment variables', link: '/en/guide/env-variables' },
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
              { text: 'การพัฒนา', link: '/th/guide/development' },
              { text: 'สถาปัตยกรรม', link: '/th/guide/architecture' },
              { text: 'ฐานข้อมูล', link: '/th/guide/database' },
              { text: 'ตัวแปรสภาพแวดล้อม', link: '/th/guide/env-variables' },
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
