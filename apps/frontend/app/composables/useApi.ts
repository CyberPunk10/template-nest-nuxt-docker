export const useApi = createUseFetch(() => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  return {
    baseURL: apiBase as string,
    retry: 1,
    retryStatusCodes: [401],

    async onResponseError({ response, request, options }) {
      if (response.status !== 401) return

      const url = typeof request === 'string' ? request : request.toString()
      if (url.includes('/auth/')) return

      const { refresh } = useRefreshToken()
      const refreshed = await refresh()

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
