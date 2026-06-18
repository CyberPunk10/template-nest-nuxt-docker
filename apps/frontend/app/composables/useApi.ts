export const useApi = createUseFetch(() => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  return {
    baseURL: apiBase as string,
    // При 401 ofetch автоматически повторяет запрос один раз.
    // К тому моменту onResponseError уже обновил токен — повтор проходит успешно.
    retry: 1,
    retryStatusCodes: [401],

    async onResponseError({ response, request, options }) {
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
        await navigateTo('/login')
      }
    },
  }
})
