// Singleton промис на время выполнения refresh.
// Все параллельные 401 ждут одного и того же результата — второй запрос
// не запускает новый refresh и не натыкается на isUsed флаг в БД.
let refreshPromise: Promise<boolean> | null = null

export function useRefreshToken() {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  async function refresh(): Promise<boolean> {
    if (refreshPromise) return refreshPromise

    refreshPromise = $fetch('/auth/refresh', {
      method: 'POST',
      baseURL: apiBase as string,
    })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })

    return refreshPromise
  }

  return { refresh }
}
