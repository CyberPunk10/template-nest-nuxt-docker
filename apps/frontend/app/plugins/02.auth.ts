export default defineNuxtPlugin(async (nuxtApp) => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()
  const { user } = useAuth()

  const apiFetch = $fetch.create({ baseURL: apiBase as string })
  type AuthUser = { id: string, name: string, email: string, createdAt: string, updatedAt: string }

  if (import.meta.server) {
    // К этому моменту server/middleware/auth.ts уже обновил куки если нужно —
    // /auth/me выполняется с актуальным access_token.
    // Куки прокидываем вручную: $fetch на сервере работает в контексте Node.js
    // и не имеет доступа к браузерным кукам — нужно явно взять их из входящего запроса.
    const cookieHeader = nuxtApp.ssrContext?.event.headers.get('cookie') ?? ''
    user.value = await apiFetch<AuthUser>('/auth/me', { headers: { cookie: cookieHeader } }).catch(
      () => null,
    )
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
