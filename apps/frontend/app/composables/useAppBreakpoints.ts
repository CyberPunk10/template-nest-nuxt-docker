import { useBreakpoints } from '@vueuse/core'

export const APP_BREAKPOINTS = {
  xs: 380, // fullscreen threshold: drawer, модалки на 100%
  md: 768, // mobile → tablet: пороги контента, вёрстка страниц
  lg: 1024, // tablet → desktop: header скрывается, sidebar из drawer становится постоянным
} as const

const breakpoints = useBreakpoints(APP_BREAKPOINTS)

export const useAppBreakpoints = () => {
  const isMobile = breakpoints.smallerOrEqual('md')
  const isTablet = breakpoints.between('md', 'lg')
  const isDesktop = breakpoints.greater('lg')

  return { isMobile, isTablet, isDesktop }
}
