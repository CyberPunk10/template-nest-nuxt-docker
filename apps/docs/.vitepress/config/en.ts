import type { LocaleEntry } from '../config'
import locale from '../locales/en.json'

// Английская локаль: страницы в en/, ссылки с префиксом /en/.
// Чтобы убрать язык из сборки: удалить этот файл и папку en/.
const config: LocaleEntry = {
  // Ключ в locales: 'root' — язык по умолчанию, остальные дают префикс в URL.
  key: 'en',
  label: 'English',
  lang: 'en',
  themeConfig: {
    outline: { level: 'deep' as const, label: 'On this page' },
    home: locale.home,
    sidebar: [
      {
        text: 'Documentation',
        items: [
          {
            text: 'Getting started',
            link: '/en/guide/getting-started/',
            collapsed: false,
            items: [
              { text: 'Setup', link: '/en/guide/getting-started/setup' },
              { text: 'With pnpm', link: '/en/guide/getting-started/run-pnpm' },
              { text: 'With Docker', link: '/en/guide/getting-started/run-docker' },
            ],
          },
          { text: 'Architecture', link: '/en/guide/architecture' },
          { text: 'Environment variables', link: '/en/guide/env-variables' },
          {
            text: 'Docker',
            link: '/en/guide/docker/',
            collapsed: true,
            items: [
              { text: 'Dockerfile', link: '/en/guide/docker/dockerfiles' },
            ],
          },
          { text: 'Reverse proxy', link: '/en/guide/reverse-proxy' },
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
}

export default config
