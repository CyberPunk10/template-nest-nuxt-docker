import DefaultTheme from 'vitepress/theme'
import type { EnhanceAppContext } from 'vitepress'
import Layout from './Layout.vue'
import Icon from './components/Icon.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    // Глобальный <Icon> — замена nuxt-иconов на стартовой странице.
    app.component('Icon', Icon)
  },
}
