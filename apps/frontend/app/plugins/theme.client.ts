/**
 * Единственное место, которое пишет в colorMode. Держит preference в согласии
 * с activeTheme из useThemePreference — тот считается только из localStorage
 * и системной схемы, поэтому обратной связи нет: поток строго в одну сторону.
 *
 * Почему плагин, а не composable в компоненте: подписка нужна с первой
 * отрисовки. Пока watch жил в useThemePreference, он запускался только после
 * монтирования ThemeSwitcher — то есть после того, как пользователь откроет
 * меню, а до этого сохранённая тема не применялась.
 *
 * Классами на <html> плагин не управляет: в preference всегда лежит конкретная
 * тема, и всю работу делает сам модуль, включая инлайн-скрипт до гидратации.
 */
export default defineNuxtPlugin(() => {
  const { activeTheme } = useThemePreference()
  const colorMode = useColorMode()

  watch(activeTheme, (theme) => {
    colorMode.preference = theme
  }, { immediate: true })
})
