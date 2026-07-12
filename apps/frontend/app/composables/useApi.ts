export const useApi = createUseFetch(() => {
  const {
    public: { apiBase },
  } = useRuntimeConfig()

  return {
    baseURL: apiBase as string,
  }
})
