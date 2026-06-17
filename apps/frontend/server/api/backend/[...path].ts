// BFF proxy: форвардит все запросы /api/backend/* на NestJS.
// proxyRequest автоматически форвардит метод, тело, куки и Set-Cookie заголовки.
export default defineEventHandler((event) => {
  const { backendUrl } = useRuntimeConfig()
  const path = event.context.params?.path ?? ''
  // Берём search-строку напрямую из URL — без парсинга и пересборки,
  // чтобы корректно форвардить массивы (?ids[]=1&ids[]=2) и спецсимволы.
  const search = getRequestURL(event).search
  const url = `${backendUrl}/${path}${search}`

  return proxyRequest(event, url)
})
