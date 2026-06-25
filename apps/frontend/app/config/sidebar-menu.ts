export interface SidebarMenuItem {
  id: string
  label: string
  icon: string
  to?: string
  children?: SidebarMenuChild[]
  dividerBefore?: boolean
}

export interface SidebarMenuChild {
  label: string
  icon: string
  to: string
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    id: 'home',
    label: 'nav.home',
    icon: 'lucide:home',
    to: '/',
  },
  {
    id: 'analytics',
    label: 'nav.analytics',
    icon: 'lucide:bar-chart-2',
    to: '/stub/analytics',
  },
  {
    id: 'users',
    label: 'nav.users',
    icon: 'lucide:users',
    dividerBefore: true,
    children: [
      { label: 'nav.usersList', icon: 'lucide:list', to: '/stub/users-list' },
      { label: 'nav.usersRoles', icon: 'lucide:shield', to: '/stub/users-roles' },
      { label: 'nav.usersInvites', icon: 'lucide:mail', to: '/stub/users-invites' },
    ],
  },
  {
    id: 'catalog',
    label: 'nav.catalog',
    icon: 'lucide:layout-grid',
    children: [
      { label: 'nav.catalogItems', icon: 'lucide:package', to: '/stub/catalog-items' },
      { label: 'nav.catalogCategories', icon: 'lucide:folder', to: '/stub/catalog-categories' },
    ],
  },
  {
    id: 'orders',
    label: 'nav.orders',
    icon: 'lucide:shopping-cart',
    to: '/stub/orders',
  },
  {
    id: 'reports',
    label: 'nav.reports',
    icon: 'lucide:file-text',
    to: '/stub/reports',
  },
  {
    id: 'settings',
    label: 'nav.settings',
    icon: 'lucide:settings',
    dividerBefore: true,
    children: [
      { label: 'nav.profile', icon: 'lucide:user', to: '/profile' },
      { label: 'nav.about', icon: 'lucide:info', to: '/about' },
    ],
  },
]
