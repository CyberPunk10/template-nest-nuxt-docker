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

  watch(isDrawerMode, () => {
    isDrawerOpen.value = false
  })

  return {
    isCollapsed,
    isDrawerMode,
    isDrawerOpen,
    toggleCollapsed,
    toggleDrawer,
  }
}
