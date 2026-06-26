import {
  analytics,
  bigSection,
  catalog,
  dashboard,
  orders,
  reports,
  settings,
  users,
  type SidebarItem,
} from '../config/sidebar-menu'

export type MenuItem = SidebarItem | { spacer: true, id: string }

export function useMenu() {
  const duplicateSpacersFilter = (item: MenuItem, idx: number, arr: MenuItem[]) =>
    !(!!item.spacer && idx > 0 && !!arr[idx - 1]!.spacer)

  function getFilteredItems(items: MenuItem[]): MenuItem[] {
    if (!Array.isArray(items)) return items

    return items
      .filter(item => !!item)
      .filter(duplicateSpacersFilter)
  }

  const leftMenu = computed(() => {
    const sections: SidebarItem[] = [
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
