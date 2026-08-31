import { docsSection, sidebarSections, type SidebarMenuItem } from '../config/sidebar-menu'

export type MenuItem = SidebarMenuItem | { spacer: true, id: string }

export function useMenu() {
  const { public: { docsUrl } } = useRuntimeConfig()

  const sidebarMenu = computed<MenuItem[]>(() => [
    ...sidebarSections,
    { spacer: true, id: 'before-docs' },
    { ...docsSection, url: docsUrl, external: true },
  ])

  return {
    sidebarMenu,
  }
}
