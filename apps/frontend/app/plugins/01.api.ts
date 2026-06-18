export default defineNuxtPlugin((nuxtApp) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: apiBase as string,
    // При 401 ofetch автоматически повторяет запрос один раз.
    // К тому моменту onResponseError уже обновил токен — повтор проходит успешно.
    retry: 1,
    retryStatusCodes: [401],

    async onResponseError({ response, request, options }) {
      if (response.status !== 401) return

      // Исключаем auth-запросы — иначе бесконечный цикл
      const url = typeof request === 'string' ? request : request.toString()
      if (url.includes('/auth/')) return

      const refreshed = await $fetch('/auth/refresh', {
        method: 'POST',
        baseURL: apiBase as string,
      })
        .then(() => true)
        .catch(() => false)

      // Refresh провалился — разлогиниваем
      if (!refreshed) {
        // Отменяем retry — повторный запрос всё равно упадёт с 401
        options.retry = 0
        const { user } = useAuth()
        user.value = null
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })

  return {
    provide: { api },
  }
})
