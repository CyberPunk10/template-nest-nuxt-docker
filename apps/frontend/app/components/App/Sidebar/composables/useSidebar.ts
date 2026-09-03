export const useSidebar = () => {
  const { isDesktop } = useAppBreakpoints()
  const isDrawerMode = computed(() => !isDesktop.value)

  const isDrawerOpen = useState('sidebar:drawerOpen', () => false)

  // save in cookie for SSR
  const collapsePreference = useCookie<boolean>('sidebar:collapsed', {
    default: () => false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  const isCollapsed = computed({
    get: () => collapsePreference.value && !(isDrawerMode.value && isDrawerOpen.value),
    set: value => collapsePreference.value = value,
  })

  function toggleDrawer(value?: boolean) {
    isDrawerOpen.value = typeof value === 'boolean' ? value : !isDrawerOpen.value
  }

  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  /* Раскрытые разделы меню. Состояние общее на все уровни вложенности SubMenu. */
  const expandedSections = useState<Record<string, boolean>>('sidebar:expandedSections', () => ({}))

  const isSectionExpanded = (id: string) => !!expandedSections.value[id]

  function setSectionExpanded(id: string, value: boolean) {
    expandedSections.value[id] = value
  }

  function collapseAllSections() {
    expandedSections.value = {}
  }

  watch(isDrawerMode, () => {
    isDrawerOpen.value = false
  })

  return {
    collapseAllSections,
    expandedSections,
    isCollapsed,
    isDrawerMode,
    isDrawerOpen,
    isSectionExpanded,
    setSectionExpanded,
    toggleCollapsed,
    toggleDrawer,
  }
}
