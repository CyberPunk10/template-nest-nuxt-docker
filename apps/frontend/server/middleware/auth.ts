// Silent refresh перед SSR: если access_token протух, но refresh_token жив —
// обновляем токены до того как Vue начнёт рендер. Это единственное место где
// Set-Cookie гарантированно доходит до браузера вместе со страницей.
export default defineEventHandler(async (event) => {
  // Пропускаем API-запросы и статику — только навигация по страницам
  const url = getRequestURL(event)
  if (url.pathname.startsWith('/api') || url.pathname.includes('.')) return

  const cookies = parseCookies(event)
  // access_token жив — refresh не нужен; нет refresh_token — сессии нет, делать нечего
  if (cookies['access_token'] || !cookies['refresh_token']) return

  const { backendUrl } = useRuntimeConfig()

  try {
    const refreshResponse = await $fetch.raw(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: { cookie: getHeader(event, 'cookie') ?? '' },
    })

    const setCookieHeaders = refreshResponse.headers.getSetCookie?.() ?? []

    // Добавляем Set-Cookie в ответ страницы — браузер сохранит новые токены
    for (const cookie of setCookieHeaders) {
      appendHeader(event, 'set-cookie', cookie)
    }

    // Обновляем cookie-заголовок текущего запроса, чтобы plugins/02.auth.ts
    // увидел новый access_token при вызове /auth/me
    if (setCookieHeaders.length) {
      const parsed = parseCookies(event)
      for (const raw of setCookieHeaders) {
        const [nameValue] = raw.split(';')
        const [name, value] = (nameValue ?? '').split('=')
        if (name && value !== undefined) parsed[name.trim()] = value.trim()
      }
      event.node.req.headers['cookie'] = Object.entries(parsed)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    }
  } catch {
    // refresh провалился (сессия истекла или инвалидирована) — продолжаем без токена
  }
})
