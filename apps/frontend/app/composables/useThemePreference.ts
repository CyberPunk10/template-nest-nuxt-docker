type ThemeId = string

const STORAGE_KEY_FOLLOW = 'theme:follow-system'
const STORAGE_KEY_LIGHT = 'theme:selected-light'
const STORAGE_KEY_DARK = 'theme:selected-dark'

const DEFAULT_LIGHT: ThemeId = 'light'
const DEFAULT_DARK: ThemeId = 'dark'

export function useThemePreference() {
  const nuxtColorMode = useColorMode()

  const followSystem = ref(localStorage.getItem(STORAGE_KEY_FOLLOW) === 'true')
  const selectedLight = ref<ThemeId>(localStorage.getItem(STORAGE_KEY_LIGHT) ?? DEFAULT_LIGHT)
  const selectedDark = ref<ThemeId>(localStorage.getItem(STORAGE_KEY_DARK) ?? DEFAULT_DARK)

  const systemIsDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', (e) => {
    systemIsDark.value = e.matches
  })

  const activeTheme = computed<ThemeId>(() => {
    if (followSystem.value) {
      return systemIsDark.value ? selectedDark.value : selectedLight.value
    }
    return nuxtColorMode.preference === 'system' ? DEFAULT_DARK : nuxtColorMode.preference
  })

  function applyTheme(id: ThemeId) {
    nuxtColorMode.preference = id
  }

  watch(activeTheme, (id) => {
    applyTheme(id)
  }, { immediate: true })

  function setFollowSystem(val: boolean) {
    followSystem.value = val
    localStorage.setItem(STORAGE_KEY_FOLLOW, String(val))
  }

  function selectTheme(id: ThemeId, kind: 'light' | 'dark') {
    if (kind === 'light') {
      selectedLight.value = id
      localStorage.setItem(STORAGE_KEY_LIGHT, id)
    } else {
      selectedDark.value = id
      localStorage.setItem(STORAGE_KEY_DARK, id)
    }
    if (!followSystem.value) {
      applyTheme(id)
    }
  }

  return { followSystem, selectedLight, selectedDark, activeTheme, setFollowSystem, selectTheme }
}
