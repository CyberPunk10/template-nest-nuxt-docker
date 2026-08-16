export default defineNuxtPlugin(async () => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()
  const { user } = useAuth()

  const apiFetch = $fetch.create({ baseURL: apiBase as string })

  if (import.meta.server) {
    // useRequestFetch форвардит заголовки входящего запроса (обычный $fetch их
    // не видит и ушёл бы без токена). Если server/middleware/auth.ts обновил
    // токены — берём свежие куки из context, они ещё не в заголовках запроса.
    const requestFetch = useRequestFetch()
    const refreshedCookie = useRequestEvent()?.context.refreshedCookie as string | undefined
    user.value = await requestFetch<AuthUser>(`${apiBase}/auth/me`, {
      headers: refreshedCookie ? { cookie: refreshedCookie } : undefined,
    }).catch(() => null)
  } else {
    // Клиент: штатный сценарий — /auth/me проходит сразу (браузер получил Set-Cookie от Nitro).
    // Fallback на refresh нужен для edge-case: токен протух между SSR и гидратацией.
    // Куки не прокидываем вручную — браузер отправляет их автоматически.
    let me = await apiFetch<AuthUser>('/auth/me').catch(() => null)
    if (!me) {
      const refreshed = await apiFetch('/auth/refresh', { method: 'POST' })
        .then(() => true)
        .catch(() => false)
      if (refreshed) {
        me = await apiFetch<AuthUser>('/auth/me').catch(() => null)
      }
    }
    user.value = me
  }
})
