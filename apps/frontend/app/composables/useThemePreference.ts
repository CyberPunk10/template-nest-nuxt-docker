import { useLocalStorage, usePreferredDark } from '@vueuse/core'

type ThemeId = string

const STORAGE_KEY_FOLLOW = 'theme:follow-system'
const STORAGE_KEY_LIGHT = 'theme:selected-light'
const STORAGE_KEY_DARK = 'theme:selected-dark'

const DEFAULT_LIGHT: ThemeId = 'light'
const DEFAULT_DARK: ThemeId = 'dark'

export function useThemePreference() {
  const nuxtColorMode = useColorMode()

  const followSystem = useLocalStorage(STORAGE_KEY_FOLLOW, false)
  const selectedLight = useLocalStorage<ThemeId>(STORAGE_KEY_LIGHT, DEFAULT_LIGHT)
  const selectedDark = useLocalStorage<ThemeId>(STORAGE_KEY_DARK, DEFAULT_DARK)

  const systemIsDark = usePreferredDark()

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
  }

  function selectTheme(id: ThemeId, kind: 'light' | 'dark') {
    if (kind === 'light') {
      selectedLight.value = id
    } else {
      selectedDark.value = id
    }
    if (!followSystem.value) {
      applyTheme(id)
    }
  }

  return { followSystem, selectedLight, selectedDark, activeTheme, setFollowSystem, selectTheme }
}
