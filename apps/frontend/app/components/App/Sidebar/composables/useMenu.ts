import {
  analytics,
  bigSection,
  catalog,
  dashboard,
  orders,
  reports,
  settings,
  users,
  type SidebarMenuChild,
  type SidebarMenuItem,
} from '../config/sidebar-menu'

type MenuItem = SidebarMenuItem | SidebarMenuChild | { spacer: true; id: string }

export function useMenu() {
  const duplicateSpacersFilter = (item: MenuItem, idx: number, arr: MenuItem[]) =>
    !('spacer' in item && item.spacer && idx > 0 && 'spacer' in arr[idx - 1] && arr[idx - 1])

  function getFilteredItems(items: MenuItem[]): MenuItem[] {
    if (!Array.isArray(items)) return items

    return items
      .filter((item) => !!item)
      .filter(duplicateSpacersFilter)
      .map((i) => {
        if (!('items' in i) || !i.items) return i
        return {
          ...i,
          items: getFilteredItems(i.items as MenuItem[]),
        }
      })
  }

  const leftMenu = computed(() => {
    const sections: SidebarMenuItem[] = [
      dashboard,
      analytics,
      users,
      catalog,
      orders,
      reports,
      bigSection,
    ]

    return getFilteredItems(sections)
  })

  const rightMenu = computed((): MenuItem[] => [{ spacer: true, id: 'before-settings' }, settings])

  return {
    leftMenu,
    rightMenu,
  }
}
