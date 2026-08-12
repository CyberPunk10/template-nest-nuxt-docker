import { useAuth } from '~/composables/useAuth'
import { useRefreshToken } from '~/composables/useRefreshToken'

// Общий 401-обработчик для useApi.ts (useFetch) и plugins/01.api.ts ($fetch) —
// оба клиента используют одну и ту же ротацию refresh-токена, но по-разному
// вызывают навигацию (navigateTo напрямую vs через nuxtApp.runWithContext).
export function createAuthErrorHandler(navigateToLogin: () => unknown) {
  return async function onResponseError({ response, request, options }: {
    response: { status: number }
    request: string | Request
    options: { retry?: number | false }
  }): Promise<void> {
    if (response.status !== 401) return

    const url = typeof request === 'string' ? request : request.toString()

    // Исключаем auth-запросы — иначе бесконечный цикл
    // retry бессмысленен, токена всё равно нет
    if (url.includes('/auth/')) {
      options.retry = 0
      return
    }

    const { refresh } = useRefreshToken()
    const refreshed = await refresh()

    // Refresh провалился — разлогиниваем
    if (!refreshed) {
      // Отменяем retry — повторный запрос всё равно упадёт с 401
      options.retry = 0
      const { user } = useAuth()
      user.value = null
      await navigateToLogin()
    }
  }
}
