import { useResizeObserver, useScroll, useThrottleFn } from '@vueuse/core'
import type { Ref } from 'vue'

export function useScrollShadow(el: Ref<HTMLElement | null>) {
  const shadowTop = ref(false)
  const shadowBottom = ref(false)

  const { y } = useScroll(el)

  function recalc() {
    if (!el.value) return
    const { scrollTop, scrollHeight, clientHeight } = el.value
    shadowTop.value = scrollTop > 0
    shadowBottom.value = scrollHeight - scrollTop - clientHeight > 1
  }

  const throttledRecalc = useThrottleFn(recalc, 50)

  watch(y, recalc)

  useResizeObserver(el, throttledRecalc)

  return { shadowTop, shadowBottom }
}
