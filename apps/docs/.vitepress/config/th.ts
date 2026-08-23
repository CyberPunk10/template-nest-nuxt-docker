import type { LocaleEntry } from '../config'
import locale from '../locales/th.json'

// Тайская локаль: страницы в th/, ссылки с префиксом /th/.
// Чтобы убрать язык из сборки: удалить этот файл и папку th/.
const config: LocaleEntry = {
  // Ключ в locales: 'root' — язык по умолчанию, остальные дают префикс в URL.
  key: 'th',
  label: 'ไทย',
  lang: 'th',
  themeConfig: {
    outline: { level: 'deep' as const, label: 'ในหน้านี้' },
    home: locale.home,
    sidebar: [
      {
        text: 'เอกสาร',
        items: [
          {
            text: 'เริ่มต้นใช้งาน',
            link: '/th/guide/getting-started/',
            collapsed: false,
            items: [
              { text: 'การเตรียมความพร้อม', link: '/th/guide/getting-started/setup' },
              { text: 'ด้วย pnpm', link: '/th/guide/getting-started/run-pnpm' },
              { text: 'ด้วย Docker', link: '/th/guide/getting-started/run-docker' },
            ],
          },
          { text: 'สถาปัตยกรรม', link: '/th/guide/architecture' },
          { text: 'ตัวแปรสภาพแวดล้อม', link: '/th/guide/env-variables' },
          {
            text: 'Docker',
            link: '/th/guide/docker/',
            collapsed: true,
            items: [
              { text: 'Dockerfile', link: '/th/guide/docker/dockerfiles' },
            ],
          },
          { text: 'Reverse proxy', link: '/th/guide/reverse-proxy' },
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
}

export default config
