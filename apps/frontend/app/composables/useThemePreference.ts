import { useLocalStorage, usePreferredDark } from '@vueuse/core'

type ThemeId = string

const STORAGE_KEY_FOLLOW = 'theme:follow-system'
const STORAGE_KEY_SELECTED = 'theme:selected'
const STORAGE_KEY_LIGHT = 'theme:selected-light'
const STORAGE_KEY_DARK = 'theme:selected-dark'

const DEFAULT_LIGHT: ThemeId = 'light'
const DEFAULT_DARK: ThemeId = 'dark'

/**
 * Тем в приложении больше двух, поэтому штатного preference: 'system' мало —
 * модуль различает только «светло или темно», а какую именно светлую и какую
 * тёмную тему брать, он не знает. Эти два выбора и хранит composable.
 *
 * Источник истины — данные этого composable, а не colorMode: activeTheme
 * вычисляется только из них и в colorMode ничего не читает. Единственный,
 * кто пишет туда, — плагин theme.client.ts. Поток строго в одну сторону.
 *
 * В colorMode.preference всегда лежит КОНКРЕТНАЯ тема, никогда 'system'.
 * Благодаря этому класс на <html> целиком ведёт модуль — включая инлайн-скрипт
 * в <head>, который отрабатывает до гидратации и снимает мигание темы.
 */
export function useThemePreference() {
  const followSystem = useLocalStorage(STORAGE_KEY_FOLLOW, false)
  const selectedLight = useLocalStorage<ThemeId>(STORAGE_KEY_LIGHT, DEFAULT_LIGHT)
  const selectedDark = useLocalStorage<ThemeId>(STORAGE_KEY_DARK, DEFAULT_DARK)

  const systemIsDark = usePreferredDark()

  // Явно выбранная тема — когда «следовать за системой» выключено.
  // Отдельный ключ, а не чтение colorMode.preference: иначе activeTheme
  // зависел бы от значения, которое сам же и определяет.
  const selected = useLocalStorage<ThemeId>(STORAGE_KEY_SELECTED, DEFAULT_DARK)

  // Тема, которая должна быть активна при текущих настройках.
  // Считается только из своих данных — в colorMode ничего не читает.
  const activeTheme = computed<ThemeId>(() =>
    followSystem.value
      ? (systemIsDark.value ? selectedDark.value : selectedLight.value)
      : selected.value,
  )

  function setFollowSystem(val: boolean) {
    // Выключая режим, фиксируем тему, которая сейчас на экране, — иначе
    // вернулась бы та, что была выбрана до включения следования за системой.
    if (!val) {
      selected.value = activeTheme.value
    }
    followSystem.value = val
  }

  function selectTheme(id: ThemeId, kind: 'light' | 'dark') {
    if (kind === 'light') {
      selectedLight.value = id
    } else {
      selectedDark.value = id
    }
    // При активном «следовать за системой» выбор только запоминается:
    // пользователь настраивает, какую тему брать для светлой и какую для
    // тёмной схемы ОС, оставаясь в системном режиме. Тумблер не трогаем.
    if (!followSystem.value) {
      selected.value = id
    }
  }

  return { followSystem, selectedLight, selectedDark, activeTheme, setFollowSystem, selectTheme }
}
