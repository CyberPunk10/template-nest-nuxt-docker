import {
  analytics,
  bigSection,
  catalog,
  dashboard,
  dbTables,
  orders,
  reports,
  settings,
  tasks,
  users,
  type SidebarMenuItem,
} from '../config/sidebar-menu'

export type MenuItem = SidebarMenuItem | { spacer: true, id: string }

export function useMenu() {
  const duplicateSpacersFilter = (item: MenuItem, idx: number, arr: MenuItem[]) =>
    !(!!item.spacer && idx > 0 && !!arr[idx - 1]!.spacer)

  function getFilteredItems(items: MenuItem[]): MenuItem[] {
    if (!Array.isArray(items)) return items

    return items
      .filter(item => !!item)
      .filter(duplicateSpacersFilter)
  }

  const { public: { docsUrl } } = useRuntimeConfig()

  const sidebarMenu = computed(() => {
    const sections: MenuItem[] = [
      dashboard,
      tasks,
      dbTables,
      analytics,
      users,
      catalog,
      orders,
      reports,
      bigSection,
      { spacer: true, id: 'before-settings' },
      { ...settings, url: docsUrl, external: true },
    ]

    return getFilteredItems(sections)
  })

  return {
    sidebarMenu,
  }
}
