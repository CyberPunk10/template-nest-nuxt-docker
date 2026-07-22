export default defineEventHandler(async (event) => {
  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3100'
  const path = event.context.params?.path ?? ''
  // Берём search-строку напрямую из URL — без парсинга и пересборки,
  // чтобы корректно форвардить массивы (?ids[]=1&ids[]=2) и спецсимволы.
  const search = getRequestURL(event).search
  const url = `${backendUrl}/${path}${search}`

  return proxyRequest(event, url)
})
