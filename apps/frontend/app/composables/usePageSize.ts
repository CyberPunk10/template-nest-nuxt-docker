import { useElementSize } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

/** size page content without sidebar */
export const usePageSize = () => {
  const pageWidth = useState<number | null>('pageSize:width', () => null)
  const pageHeight = useState<number | null>('pageSize:height', () => null)

  return { pageWidth, pageHeight }
}

export const useTrackPageSize = (appPage: MaybeRefOrGetter<HTMLElement | null>) => {
  const { pageWidth, pageHeight } = usePageSize()
  const { width, height } = useElementSize(appPage)

  watch(width, v => pageWidth.value = v)
  watch(height, v => pageHeight.value = v)
}
