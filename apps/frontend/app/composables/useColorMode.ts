export function useColorMode() {
  const preference = ref<'light' | 'dark' | 'system'>('light')
  const value = computed(() => (preference.value === 'system' ? 'light' : preference.value))

  return { preference, value }
}
