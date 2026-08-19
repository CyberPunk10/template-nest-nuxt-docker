import type { DevConfigResponse } from '@repo/shared'

// Ссылки на сервисы для DevPanel. Адрес бэкенда приходит от него самого
// через /dev/config: в pnpm dev это его порт, за reverse proxy — пустая строка,
// то есть тот же origin, что и у фронтенда.
export function useDevLinks() {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  const frontendUrl = useRequestURL().origin

  const { data: config, error } = useFetch<DevConfigResponse>('/dev/config', {
    baseURL: apiBase,
    key: 'dev-config',
  })

  // Пока ответ не пришёл — считаем, что бэкенд за тем же origin:
  // ссылки останутся рабочими в самом частом случае (Docker).
  const backendUrl = computed(() => config.value?.publicUrl || frontendUrl)

  return {
    // Ответ на /dev/config сам по себе доказывает, что бэкенд жив —
    // отдельный запрос к /health для этого не нужен.
    backendOnline: computed(() => !!config.value && !error.value),
    swaggerEnabled: computed(() => config.value?.swagger ?? false),
    swaggerUrl: computed(() => `${backendUrl.value}/api/docs`),
    // Health-check: напрямую, когда порт бэкенда открыт; иначе через
    // BFF-прокси — единственный путь к нему снаружи.
    backendHealthUrl: computed(() =>
      config.value?.publicUrl
        ? `${config.value.publicUrl}/health`
        : `${frontendUrl}${apiBase}/health`,
    ),
  }
}
