/** Пункт меню: id обязателен — по нему хранится «раскрыт ли» и ищется родитель */
export interface SidebarLink {
  id: string
  title: string
  icon?: string
  url?: string
  classes?: string
  external?: boolean
  newTab?: boolean
  items?: SidebarMenuItem[]
  spacer?: never
}

/** Разделитель между группами пунктов — ни заголовка, ни ссылки, ни вложенных */
export interface SidebarSpacer {
  spacer: true
  id: string
}

export type SidebarMenuItem = SidebarLink | SidebarSpacer

/** Разделитель это не пункт: у него нет ни title, ни url, ни items */
export const isSpacer = (item: SidebarMenuItem): item is SidebarSpacer => 'spacer' in item

/** Раздел с вложенными пунктами: id обязателен — по нему хранится «раскрыт ли» */
export type SidebarSection = SidebarLink & { items: SidebarMenuItem[] }

/** Раскрываемый ли это раздел: только у таких есть вложенные пункты */
export const isSection = (item: SidebarMenuItem): item is SidebarSection =>
  !isSpacer(item) && !!item.items?.length

export const sidebarSections = [
  {
    id: 'dashboard',
    title: 'nav.home',
    url: '/',
    icon: 'home',
  },
  {
    id: 'tasks',
    title: 'nav.tasks',
    url: '/tasks',
    icon: 'lucide:list-todo',
  },
  {
    id: 'db-tables',
    title: 'nav.dbTables',
    url: '/db-tables',
    icon: 'lucide:database',
  },
  {
    id: 'analytics',
    title: 'nav.analytics',
    url: '/stub/analytics',
    icon: 'lucide:bar-chart-2',
  },
  {
    id: 'users',
    title: 'nav.users',
    icon: 'lucide:users',
    items: [
      {
        id: 'users-list',
        title: 'nav.usersList',
        url: '/stub/users-list',
        icon: 'lucide:list',
      },
      {
        id: 'users-roles',
        title: 'nav.usersRoles',
        icon: 'lucide:shield',
        items: [
          {
            id: 'users-roles-admin',
            title: 'nav.usersRolesAdmin',
            url: '/stub/users-roles-admin',
            icon: 'lucide:crown',
          },
          {
            id: 'users-roles-manager',
            title: 'nav.usersRolesManager',
            url: '/stub/users-roles-manager',
            icon: 'lucide:user-check',
          },
          {
            id: 'users-roles-guest',
            title: 'nav.usersRolesGuest',
            url: '/stub/users-roles-guest',
            icon: 'lucide:user-minus',
          },
        ],
      },
      {
        id: 'users-invites',
        title: 'nav.usersInvites',
        url: '/stub/users-invites',
        icon: 'lucide:mail',
      },
    ],
  },
  {
    id: 'catalog',
    title: 'nav.catalog',
    icon: 'lucide:layout-grid',
    items: [
      {
        id: 'catalog-items',
        title: 'nav.catalogItems',
        url: '/stub/catalog-items',
        icon: 'lucide:package',
      },
      {
        id: 'catalog-categories',
        title: 'nav.catalogCategories',
        url: '/stub/catalog-categories',
        icon: 'lucide:folder',
      },
    ],
  },
  {
    id: 'orders',
    title: 'nav.orders',
    url: '/stub/orders',
    icon: 'lucide:shopping-cart',
  },
  {
    id: 'reports',
    title: 'nav.reports',
    url: '/stub/reports',
    icon: 'lucide:file-text',
  },

  // url подставляется динамически в useMenu() из runtimeConfig.public.docsUrl
  {
    id: 'big-section',
    title: 'nav.bigSection',
    icon: 'lucide:bar-chart-2',
    items: [
      { id: 'bs-daily', title: 'nav.bs1', url: '/stub/bs-daily', icon: 'lucide:calendar' },
      { id: 'bs-weekly', title: 'nav.bs2', url: '/stub/bs-weekly', icon: 'lucide:calendar-days' },
      { id: 'bs-monthly', title: 'nav.bs3', url: '/stub/bs-monthly', icon: 'lucide:calendar-range' },
      { id: 'bs-quarterly', title: 'nav.bs4', url: '/stub/bs-quarterly', icon: 'lucide:trending-up' },
      { id: 'bs-annual', title: 'nav.bs5', url: '/stub/bs-annual', icon: 'lucide:zap' },
      { spacer: true, id: 'bs-before-finance' },
      { id: 'bs-revenue', title: 'nav.bs6', url: '/stub/bs-revenue', icon: 'lucide:circle-dollar-sign' },
      { id: 'bs-expenses', title: 'nav.bs7', url: '/stub/bs-expenses', icon: 'lucide:receipt' },
      { id: 'bs-profit', title: 'nav.bs8', url: '/stub/bs-profit', icon: 'lucide:activity' },
      { id: 'bs-conversion', title: 'nav.bs9', url: '/stub/bs-conversion', icon: 'lucide:filter' },
      { id: 'bs-traffic', title: 'nav.bs10', url: '/stub/bs-traffic', icon: 'lucide:layers' },
      { spacer: true, id: 'bs-before-traffic' },
      { id: 'bs-sources', title: 'nav.bs11', url: '/stub/bs-sources', icon: 'lucide:split' },
      { id: 'bs-retention', title: 'nav.bs12', url: '/stub/bs-retention', icon: 'lucide:repeat' },
      { id: 'bs-cohorts', title: 'nav.bs13', url: '/stub/bs-cohorts', icon: 'lucide:grid-2x2' },
      { id: 'bs-funnels', title: 'nav.bs14', url: '/stub/bs-funnels', icon: 'lucide:megaphone' },
      { id: 'bs-heatmap', title: 'nav.bs15', url: '/stub/bs-heatmap', icon: 'lucide:map' },
      { id: 'bs-segments', title: 'nav.bs16', url: '/stub/bs-segments', icon: 'lucide:puzzle' },
      { id: 'bs-campaigns', title: 'nav.bs17', url: '/stub/bs-campaigns', icon: 'lucide:bell' },
      { id: 'bs-channels', title: 'nav.bs18', url: '/stub/bs-channels', icon: 'lucide:radio' },
      { id: 'bs-custom', title: 'nav.bs19', url: '/stub/bs-custom', icon: 'lucide:settings' },
      { id: 'bs-export', title: 'nav.bs20', url: '/stub/bs-export', icon: 'lucide:file-text' },
      { spacer: true, id: 'bs-before-meta' },
      { id: 'bs-tags', title: 'nav.bs21', url: '/stub/bs-tags', icon: 'lucide:tag' },
      { id: 'bs-labels', title: 'nav.bs22', url: '/stub/bs-labels', icon: 'lucide:bookmark' },
      { id: 'bs-goals', title: 'nav.bs23', url: '/stub/bs-goals', icon: 'lucide:target' },
      { id: 'bs-alerts', title: 'nav.bs24', url: '/stub/bs-alerts', icon: 'lucide:bell' },
      { id: 'bs-webhooks', title: 'nav.bs25', url: '/stub/bs-webhooks', icon: 'lucide:webhook' },
      { id: 'bs-api', title: 'nav.bs26', url: '/stub/bs-api', icon: 'lucide:terminal' },
      { id: 'bs-tokens', title: 'nav.bs27', url: '/stub/bs-tokens', icon: 'lucide:key-round' },
      { id: 'bs-logs', title: 'nav.bs28', url: '/stub/bs-logs', icon: 'lucide:scroll-text' },
      { id: 'bs-audit', title: 'nav.bs29', url: '/stub/bs-audit', icon: 'lucide:shield' },
      { id: 'bs-archive', title: 'nav.bs30', url: '/stub/bs-archive', icon: 'lucide:archive' },
    ],
  },
] satisfies SidebarMenuItem[]

/** Ссылка на документацию: url подставляется из runtimeConfig в useMenu */
export const docsSection = {
  id: 'docs',
  title: 'nav.docs',
  icon: 'lucide:book-open',
} satisfies SidebarMenuItem
