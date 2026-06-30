import type { SidebarMenuItem } from './sidebar-menu'

export interface SidebarDivider {
  id: string
  divider: true
}

export interface SidebarSlot {
  id: string
  slot: true
}

export type UserMenuItem = (SidebarMenuItem & { id: string }) | SidebarDivider | SidebarSlot

export interface ThemeItem {
  id: string
  title: string
  icon: string
  kind: 'light' | 'dark'
}

export const userMenu: UserMenuItem[] = [
  {
    id: 'profile',
    title: 'userMenu.profile',
    icon: 'lucide:user',
    url: '/profile',
  },
  {
    id: 'settings',
    title: 'userMenu.settings',
    icon: 'lucide:settings',
    url: '/stub/settings',
  },
  { id: 'divider-account', divider: true },
  {
    id: 'notifications',
    title: 'userMenu.notifications',
    icon: 'lucide:bell',
    url: '/stub/notifications',
  },
  { id: 'language', slot: true },
  { id: 'appearance', slot: true },
  { id: 'divider-preferences', divider: true },
  {
    id: 'changelog',
    title: 'userMenu.changelog',
    icon: 'lucide:sparkles',
    url: '/stub/changelog',
  },
  {
    id: 'help',
    title: 'userMenu.help',
    icon: 'lucide:circle-help',
    url: '/stub/help',
  },
]

export const themes: ThemeItem[] = [
  {
    id: 'light',
    title: 'themes.light',
    icon: 'light-theme',
    kind: 'light',
  },
  {
    id: 'light-sand',
    title: 'themes.lightSand',
    icon: 'light-sand-theme',
    kind: 'light',
  },
  {
    id: 'light-mist',
    title: 'themes.lightMist',
    icon: 'light-mist-theme',
    kind: 'light',
  },
  {
    id: 'light-rose',
    title: 'themes.lightRose',
    icon: 'light-rose-theme',
    kind: 'light',
  },
  {
    id: 'dark',
    title: 'themes.dark',
    icon: 'dark-theme',
    kind: 'dark',
  },
  {
    id: 'dark-green',
    title: 'themes.darkGreen',
    icon: 'dark-green-theme',
    kind: 'dark',
  },
  {
    id: 'dark-midnight',
    title: 'themes.darkMidnight',
    icon: 'dark-midnight-theme',
    kind: 'dark',
  },
  {
    id: 'dark-ocean',
    title: 'themes.darkOcean',
    icon: 'dark-ocean-theme',
    kind: 'dark',
  },
]
