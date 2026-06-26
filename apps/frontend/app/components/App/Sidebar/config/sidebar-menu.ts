export interface SidebarMenuItem {
  id: string
  title: string
  icon: string
  url?: string
  classes?: string
  params?: Record<string, string>
  ignoreParams?: boolean
  items?: SidebarMenuChild[]
}

export interface SidebarMenuChild {
  id?: string
  title: string
  icon?: string
  url?: string
  classes?: string
  items?: SidebarMenuChild[]
  spacer?: boolean
  params?: Record<string, string>
  ignoreParams?: boolean
  external?: boolean
}

export const dashboard: SidebarMenuItem = {
  id: 'dashboard',
  title: 'nav.home',
  url: '/',
  icon: 'home',
}

export const analytics: SidebarMenuItem = {
  id: 'analytics',
  title: 'nav.analytics',
  url: '/stub/analytics',
  icon: 'lucide:bar-chart-2',
}

export const users: SidebarMenuItem = {
  id: 'users',
  title: 'nav.users',
  icon: 'lucide:users',
  classes: '--users-section',
  items: [
    {
      title: 'nav.usersList',
      url: '/stub/users-list',
      icon: 'lucide:list',
    },
    {
      id: 'users-roles',
      title: 'nav.usersRoles',
      icon: 'lucide:shield',
      items: [
        { title: 'nav.usersRolesAdmin', url: '/stub/users-roles-admin', icon: 'lucide:crown' },
        {
          title: 'nav.usersRolesManager',
          url: '/stub/users-roles-manager',
          icon: 'lucide:user-check',
        },
        { title: 'nav.usersRolesGuest', url: '/stub/users-roles-guest', icon: 'lucide:user-minus' },
      ],
    },
    {
      title: 'nav.usersInvites',
      url: '/stub/users-invites',
      icon: 'lucide:mail',
    },
  ],
}

export const catalog: SidebarMenuItem = {
  id: 'catalog',
  title: 'nav.catalog',
  icon: 'lucide:layout-grid',
  classes: '--catalog-section',
  items: [
    {
      title: 'nav.catalogItems',
      url: '/stub/catalog-items',
      icon: 'lucide:package',
    },
    {
      title: 'nav.catalogCategories',
      url: '/stub/catalog-categories',
      icon: 'lucide:folder',
    },
  ],
}

export const orders: SidebarMenuItem = {
  id: 'orders',
  title: 'nav.orders',
  url: '/stub/orders',
  icon: 'lucide:shopping-cart',
}

export const reports: SidebarMenuItem = {
  id: 'reports',
  title: 'nav.reports',
  url: '/stub/reports',
  icon: 'lucide:file-text',
}

export const settings: SidebarMenuItem = {
  id: 'settings',
  title: 'nav.about',
  url: '/about',
  icon: 'lucide:info',
}

export const bigSection: SidebarMenuItem = {
  id: 'big-section',
  title: 'nav.bigSection',
  icon: 'lucide:bar-chart-2',
  items: [
    { title: 'nav.bs1', url: '/stub/bs-daily', icon: 'lucide:calendar' },
    { title: 'nav.bs2', url: '/stub/bs-weekly', icon: 'lucide:calendar-days' },
    { title: 'nav.bs3', url: '/stub/bs-monthly', icon: 'lucide:calendar-range' },
    { title: 'nav.bs4', url: '/stub/bs-quarterly', icon: 'lucide:trending-up' },
    { title: 'nav.bs5', url: '/stub/bs-annual', icon: 'lucide:zap' },
    { title: 'nav.bs6', url: '/stub/bs-revenue', icon: 'lucide:circle-dollar-sign' },
    { title: 'nav.bs7', url: '/stub/bs-expenses', icon: 'lucide:receipt' },
    { title: 'nav.bs8', url: '/stub/bs-profit', icon: 'lucide:activity' },
    { title: 'nav.bs9', url: '/stub/bs-conversion', icon: 'lucide:filter' },
    { title: 'nav.bs10', url: '/stub/bs-traffic', icon: 'lucide:layers' },
    { title: 'nav.bs11', url: '/stub/bs-sources', icon: 'lucide:split' },
    { title: 'nav.bs12', url: '/stub/bs-retention', icon: 'lucide:repeat' },
    { title: 'nav.bs13', url: '/stub/bs-cohorts', icon: 'lucide:grid-2x2' },
    { title: 'nav.bs14', url: '/stub/bs-funnels', icon: 'lucide:megaphone' },
    { title: 'nav.bs15', url: '/stub/bs-heatmap', icon: 'lucide:map' },
    { title: 'nav.bs16', url: '/stub/bs-segments', icon: 'lucide:puzzle' },
    { title: 'nav.bs17', url: '/stub/bs-campaigns', icon: 'lucide:bell' },
    { title: 'nav.bs18', url: '/stub/bs-channels', icon: 'lucide:radio' },
    { title: 'nav.bs19', url: '/stub/bs-custom', icon: 'lucide:settings' },
    { title: 'nav.bs20', url: '/stub/bs-export', icon: 'lucide:file-text' },
    { title: 'nav.bs21', url: '/stub/bs-tags', icon: 'lucide:tag' },
    { title: 'nav.bs22', url: '/stub/bs-labels', icon: 'lucide:bookmark' },
    { title: 'nav.bs23', url: '/stub/bs-goals', icon: 'lucide:target' },
    { title: 'nav.bs24', url: '/stub/bs-alerts', icon: 'lucide:bell' },
    { title: 'nav.bs25', url: '/stub/bs-webhooks', icon: 'lucide:webhook' },
    { title: 'nav.bs26', url: '/stub/bs-api', icon: 'lucide:terminal' },
    { title: 'nav.bs27', url: '/stub/bs-tokens', icon: 'lucide:key-round' },
    { title: 'nav.bs28', url: '/stub/bs-logs', icon: 'lucide:scroll-text' },
    { title: 'nav.bs29', url: '/stub/bs-audit', icon: 'lucide:shield' },
    { title: 'nav.bs30', url: '/stub/bs-archive', icon: 'lucide:archive' },
  ],
}

export const userMenu: SidebarMenuChild[] = [
  { title: 'userMenu.profile', icon: 'lucide:user', url: '/profile' },
  { title: 'userMenu.settings', icon: 'lucide:settings', url: '/stub/settings' },
  { title: 'userMenu.notifications', icon: 'lucide:bell', url: '/stub/notifications' },
  { title: 'userMenu.changelog', icon: 'lucide:sparkles', url: '/stub/changelog' },
  { title: 'userMenu.help', icon: 'lucide:circle-help', url: '/stub/help' },
]

export const themeSwither: SidebarMenuItem = {
  id: 'theme-swither',
  title: 'themes.light',
  icon: 'light-theme',
  items: [
    {
      id: 'light',
      title: 'themes.light',
      icon: 'light-theme',
    },
    {
      id: 'dark',
      title: 'themes.dark',
      icon: 'dark-theme',
    },
    {
      id: 'system',
      title: 'themes.system',
      icon: 'system-theme',
    },
    {
      id: 'dark-green',
      title: 'themes.darkGreen',
      icon: 'dark-green-theme',
    },
    {
      id: 'dark-midnight',
      title: 'themes.darkMidnight',
      icon: 'dark-midnight-theme',
    },
    {
      id: 'dark-ocean',
      title: 'themes.darkOcean',
      icon: 'dark-ocean-theme',
    },
  ],
}
