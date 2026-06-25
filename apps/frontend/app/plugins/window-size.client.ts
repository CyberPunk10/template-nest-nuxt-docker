import { defineNuxtPlugin } from '#app'
import { reactive } from 'vue'

function throttle(fn, wait, { leading = true } = {}) {
  let last = 0
  let timer = null
  return function (...args) {
    const now = Date.now()
    if (leading && now - last >= wait) {
      last = now
      fn.apply(this, args)
    } else {
      clearTimeout(timer)
      timer = setTimeout(
        () => {
          last = Date.now()
          fn.apply(this, args)
        },
        wait - (now - last),
      )
    }
  }
}

interface WindowSize {
  width: number | null
  height: number | null
  isMobile: boolean
  isTablet: boolean
  contentWidth: number | null
  contentHeight: number | null
}

export default defineNuxtPlugin((nuxtApp) => {
  const windowSize = reactive<WindowSize>({
    width: null,
    height: null,
    isMobile: false,
    isTablet: false,
    contentWidth: null, // .app-page (без aside), обновляется в layout
    contentHeight: null, // обновляется в layout
  })

  function updateWindowSize({ width, height }: { width: number; height: number }) {
    windowSize.width = width
    windowSize.height = height
    windowSize.isMobile = width <= 540
    windowSize.isTablet = width <= 768
  }

  function onWindowResize() {
    updateWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  const throttledOnWindowResize = throttle(onWindowResize, 100)

  window.addEventListener('resize', throttledOnWindowResize, false)
  throttledOnWindowResize()

  nuxtApp.provide('windowSize', windowSize)
})
