import ru from '@repo/shared/src/i18n/ru.json'
import en from '@repo/shared/src/i18n/en.json'
import th from '@repo/shared/src/i18n/th.json'

export default defineI18nConfig(() => ({
  legacy: false,
  messages: { ru, en, th },
}))
