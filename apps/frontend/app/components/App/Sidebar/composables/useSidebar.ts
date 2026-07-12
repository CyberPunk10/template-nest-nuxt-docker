export const MENU_TYPE = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
} as const

export type MenuType = (typeof MENU_TYPE)[keyof typeof MENU_TYPE]

export const useSidebar = () => {
  const isCollapsed = useState('sidebar:isCollapsed', () => false)
  const isMobileOpen = useState('sidebar:isMobileOpen', () => false)
  const menuType = useState<MenuType>('sidebar:menuType', () => MENU_TYPE.DESKTOP)

  return { isCollapsed, isMobileOpen, menuType }
}
