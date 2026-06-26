import { useBreakpoints } from '@vueuse/core'

export const APP_BREAKPOINTS = {
  mobile: 540,
  tablet: 768,
  desktop: 900,
} as const

const breakpoints = useBreakpoints(APP_BREAKPOINTS)

export const useAppBreakpoints = () => {
  const isMobile = breakpoints.smallerOrEqual('mobile')
  const isTablet = breakpoints.smallerOrEqual('tablet')
  const isDesktop = breakpoints.greater('tablet')

  return { isMobile, isTablet, isDesktop }
}
