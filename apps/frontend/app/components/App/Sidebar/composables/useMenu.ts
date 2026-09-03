import { docsSection, sidebarSections, type SidebarMenuItem } from '../config/sidebar-menu'

export function useMenu() {
  const { public: { docsUrl } } = useRuntimeConfig()

  const sidebarMenu = computed<SidebarMenuItem[]>(() => [
    ...sidebarSections,
    { spacer: true, id: 'before-docs' },
    { ...docsSection, url: docsUrl, external: true },
  ])

  return {
    sidebarMenu,
  }
}
