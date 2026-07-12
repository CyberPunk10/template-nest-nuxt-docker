import { plugin as VueTippy, roundArrow } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/dist/svg-arrow.css'
import 'tippy.js/dist/border.css'
import 'tippy.js/animations/shift-away-subtle.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    defaultProps: {
      theme: 'app',
      placement: 'right',
      arrow: roundArrow + roundArrow,
      animation: 'shift-away-subtle',
      duration: [100, 75],
    },
  })
})
