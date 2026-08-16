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

    // Кладём свежие куки в context — plugins/02.auth.ts возьмёт их оттуда для
    // /auth/me. event.context — штатный канал h3 для передачи данных между
    // обработчиками одного запроса, мутировать заголовки запроса не нужно.
    if (setCookieHeaders.length) {
      const cookieJar = parseCookies(event)
      for (const raw of setCookieHeaders) {
        // Первый сегмент до ';' — это "name=value", дальше атрибуты (Path, HttpOnly...).
        // Режем по ПЕРВОМУ '=': значение может содержать свои (base64 с padding).
        const nameValue = raw.split(';')[0] ?? ''
        const eq = nameValue.indexOf('=')
        if (eq < 1) continue
        cookieJar[nameValue.slice(0, eq).trim()] = nameValue.slice(eq + 1).trim()
      }

      event.context.refreshedCookie = Object.entries(cookieJar)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ')
    }
  } catch {
    // refresh провалился (сессия истекла или инвалидирована) — продолжаем без токена
  }
})
