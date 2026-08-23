import type { LocaleEntry } from '../config'
import locale from '../locales/ru.json'

// Русский язык — корневая локаль, страницы лежат в корне docs.
// Чтобы убрать язык из сборки: удалить этот файл и папку с его страницами.
const config: LocaleEntry = {
  // Ключ в locales: 'root' — язык по умолчанию, остальные дают префикс в URL.
  key: 'root',
  label: 'Русский',
  lang: 'ru',
  themeConfig: {
    outline: { level: 'deep' as const, label: 'На странице' },
    // Переводы стартовой страницы. Кладём в themeConfig — VitePress отдаёт
    // их через useData().theme, реактивно к локали. Заменяет vue-i18n.
    home: locale.home,
    sidebar: [
      {
        text: 'Документация',
        items: [
          {
            text: 'Запуск проекта',
            link: '/guide/getting-started/',
            collapsed: false,
            items: [
              { text: 'Подготовка', link: '/guide/getting-started/setup' },
              { text: 'Через pnpm', link: '/guide/getting-started/run-pnpm' },
              { text: 'Через Docker', link: '/guide/getting-started/run-docker' },
            ],
          },
          { text: 'Архитектура', link: '/guide/architecture' },
          { text: 'Переменные окружения', link: '/guide/env-variables' },
          {
            text: 'Docker',
            link: '/guide/docker/',
            collapsed: true,
            items: [
              { text: 'Dockerfile', link: '/guide/docker/dockerfiles' },
            ],
          },
          { text: 'Reverse proxy', link: '/guide/reverse-proxy' },
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
}

export default config
