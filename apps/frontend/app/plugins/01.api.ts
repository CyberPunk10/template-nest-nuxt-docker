export default defineNuxtPlugin(() => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: apiBase as string,
  })

  return {
    provide: { api },
  }
})
