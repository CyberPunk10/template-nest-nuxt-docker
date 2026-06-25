<script>
import { onClickOutside } from '@vueuse/core'
import { MENU_TYPE, useSidebar } from '~/composables/useSidebar'
import { useMenu } from '../composables/useMenu'
import { themeSwither } from '../config/sidebar-menu'

export default defineNuxtComponent({
  name: 'AppAside',
  components: {
    AsideLink: defineAsyncComponent(() => import('~/components/App/Sidebar/ui/core/AsideLink.vue')),
    AsideLinkProfile: defineAsyncComponent(
      () => import('~/components/App/Sidebar/ui/AsideLinkProfile/index.vue'),
    ),
    AsideLogo: defineAsyncComponent(() => import('~/components/App/Sidebar/ui/AsideLogo.vue')),
    AsideShadow: defineAsyncComponent(
      () => import('~/components/App/Sidebar/ui/core/AsideShadow.vue'),
    ),
    SubMenu: defineAsyncComponent(() => import('~/components/App/Sidebar/ui/core/SubMenu.vue')),
    ToggleMini: defineAsyncComponent(
      () => import('~/components/App/Sidebar/ui/core/ToggleMini.vue'),
    ),
  },
  setup() {
    const { $globalEvents, $windowSize } = useNuxtApp()
    const { isCollapsed, isMobileOpen, menuType } = useSidebar()

    const asideRef = ref(null)
    const asideScrollRef = ref(null)
    const onClickOutsideRef = ref(null)

    const isAsideDesktop = computed(() => menuType.value === MENU_TYPE.DESKTOP)

    const isIgnoreClickOutsideVal = ref(false)
    const triggerScrollHandler = ref(false)
    const notCollapsedItems = ref({})

    watch(() => $windowSize.width, updateAsideState)

    const { leftMenu, rightMenu } = useMenu()

    const menu = computed(() => [...leftMenu.value, ...rightMenu.value])

    function initAsideState() {
      // при переключении между разными layout повторно происходит загрузка компонента Aside,
      // это строка закроет открытые меню в мобилке, при переключении между layouts
      toggleAside({ value: false })

      const { width, height } = $windowSize
      isCollapsed.value = width > 768 && width <= 900 && height > 540

      if (width > 768 && height > 540) {
        menuType.value = MENU_TYPE.DESKTOP
        isMobileOpen.value = false

        $globalEvents.emit('body-overflow', false)
      } else {
        menuType.value =
          menuType.value === MENU_TYPE.MOBILE_RIGHT ? MENU_TYPE.MOBILE_RIGHT : MENU_TYPE.MOBILE_LEFT
      }
    }

    function updateAsideState() {
      const { width, height } = $windowSize
      isCollapsed.value = width > 768 && width <= 900 && height > 540

      if (width > 768 && height > 540) {
        menuType.value = MENU_TYPE.DESKTOP
        isMobileOpen.value = false

        $globalEvents.emit('body-overflow', false)
      } else {
        menuType.value =
          menuType.value === MENU_TYPE.MOBILE_RIGHT ? MENU_TYPE.MOBILE_RIGHT : MENU_TYPE.MOBILE_LEFT
      }
    }

    onMounted(() => {
      initAsideState()

      $globalEvents.on('toggle-sidebar', toggleAside)
      $globalEvents.on('collapse-sidebar', setCollapseFromEventBus)
      $globalEvents.on('scroll-sidebar', scrollAside)
    })
    onBeforeUnmount(() => {
      $globalEvents.off('toggle-sidebar', toggleAside)
      $globalEvents.off('collapse-sidebar', setCollapseFromEventBus)
      $globalEvents.off('scroll-sidebar', scrollAside)
    })

    function setCollapseFromEventBus({ id, value = false }) {
      if (!id) return

      if (value) {
        scrollAside({ y: 0 })
      }

      onClickSection({ id, value })
    }

    function onToggleCollapse({ id, value = false }) {
      if (!id) return

      notCollapsedItems.value[id] = value

      triggerScrollHandler.value = !triggerScrollHandler.value
    }

    function scrollAside({ y = 0, speed = 0 }) {
      asideScrollRef.value.$el?.scrollTo({ y }, speed)
    }

    function getMenuItemById(id, items = menu.value, parent = null) {
      for (const item of items) {
        if (item.id === id) {
          return { ...item, parent }
        }
        if (item?.items?.length) {
          const nestedItem = getMenuItemById(id, item.items, item)
          if (nestedItem) return nestedItem
        }
      }
      return null
    }

    function getSectionById(id) {
      let section
      if (id === themeSwither.id) section = themeSwither
      else section = getMenuItemById(id)
      if (!section) {
        section = getMenuItemById(id, themeSwither.items, themeSwither)
      }
      return section
    }

    function onClickSection({ id, value }) {
      const section = getSectionById(id)

      if (!section?.items?.length) {
        const isThemeSwither = section?.parent?.id === themeSwither.id

        $globalEvents.emit('toggle-sidebar', { value: false })

        if (isCollapsed.value || isThemeSwither) {
          resetCollapsed()
        }
        return
      }

      if (!id) return

      const resultValue = typeof value === 'boolean' ? value : !notCollapsedItems.value[id]
      resetCollapsed()

      // если меню вложенное, сначала раскрыть родительское
      if (section?.parent) {
        onToggleCollapse({ id: section?.parent.id, value: true })
      }
      onToggleCollapse({ id, value: resultValue })
    }

    onClickOutside(onClickOutsideRef, onClickOutsideAside)

    function onClickOutsideAside() {
      if (isIgnoreClickOutsideVal.value) {
        isIgnoreClickOutsideVal.value = false
        return
      }
      requestAnimationFrame(() => {
        if (!isCollapsed.value) {
          if (menuType.value === MENU_TYPE.DESKTOP) {
            notCollapsedItems.value[themeSwither.id] = false
          }
          return
        }
        closeSubMenu()
      })
    }

    function clickByShadow() {
      toggleAside({ value: false })
    }

    function closeSubMenu() {
      resetCollapsed()
    }

    function resetCollapsed() {
      Object.keys(notCollapsedItems.value).forEach((collapseId) => {
        notCollapsedItems.value[collapseId] = false
      })
    }

    function toggleAside({ value, type = menuType.value }) {
      const isBooleanValue = typeof value === 'boolean'
      const newValue = isBooleanValue ? value : !isMobileOpen.value

      $globalEvents.emit('body-overflow', newValue)

      isMobileOpen.value = newValue

      if (!isAsideDesktop.value) {
        let direction = 'left'

        if (type === MENU_TYPE.MOBILE_LEFT) direction = 'left'
        if (type === MENU_TYPE.MOBILE_RIGHT) {
          direction = 'right'

          // если правое меню закрывается, то сворачиваем themeSwither
          if (value === false && notCollapsedItems.value[themeSwither.id]) {
            notCollapsedItems.value[themeSwither.id] = false
          }
        }

        const appAsideEl = asideRef.value

        if (!appAsideEl) {
          menuType.value = type
        } else if (!newValue) {
          if (direction === 'right') {
            appAsideEl.style.right = 0
          } else if (direction === 'left') {
            appAsideEl.style.left = 0
          }

          // После завершения анимации очищаем установленные стили
          setTimeout(() => {
            if (direction === 'right') {
              appAsideEl.style.right = ''
            } else if (direction === 'left') {
              appAsideEl.style.left = ''
            }

            menuType.value = type
          }, 400)
        } else {
          if (direction === 'right') {
            appAsideEl.style.right = 'calc(var(--app-sidebar-width) * -1)'
          } else if (direction === 'left') {
            appAsideEl.style.left = 'calc(var(--app-sidebar-width) * -1)'
          }

          menuType.value = type

          // После завершения анимации очищаем установленные стили
          setTimeout(() => {
            if (direction === 'right') {
              appAsideEl.style.right = ''
            } else if (direction === 'left') {
              appAsideEl.style.left = ''
            }
          }, 400)
        }
      }
    }

    function toggleSideBarWidth() {
      closeSubMenu()
      requestAnimationFrame(() => {
        isCollapsed.value = !isCollapsed.value
      })
    }

    return {
      // refs
      asideRef,
      asideScrollRef,
      onClickOutsideRef,

      // sidebar state
      isCollapsed,
      isMobileOpen,

      clickByShadow,
      isAsideDesktop,
      menu,
      notCollapsedItems,
      onClickOutsideAside,
      onClickSection,
      onToggleCollapse,
      resetCollapsed,
      scrollAside,
      setCollapseFromEventBus,
      toggleAside,
      toggleSideBarWidth,
      triggerScrollHandler,
    }
  },
})
</script>

<template>
  <div
    ref="onClickOutsideRef"
    class="app-aside__wrapper"
    :class="{
      '--shadow-mobile-opened': isMobileOpen,
      '--collapsed': isCollapsed,
    }"
    data-test-id="aside-wrapper"
  >
    <AsideShadow @click="clickByShadow" />

    <ToggleMini
      v-if="isAsideDesktop"
      data-test-id="toggle-mini"
      @toggle-sidebar-width="toggleSideBarWidth"
    />

    <div
      ref="asideRef"
      class="app-aside"
      :class="{ '--collapsed': isCollapsed }"
      data-test-id="aside-menu"
    >
      <AsideLogo />

      <app-scroll-shadow
        ref="asideScrollRef"
        class="aside-menu"
        :class="{
          '--collapsed': isCollapsed,
        }"
        :triggerScrollHandler="triggerScrollHandler"
        withoutIgnoreSwipe
        data-test-id="aside-scroll-menu"
      >
        <!-- Items menu -->
        <template v-for="(item, index) in menu">
          <app-spacer v-if="item.spacer" :key="`app-spacer-${index}`" :data-spacer-id="item.id" />

          <div v-else :key="`aside-item-${index}`" class="aside-menu__item">
            <AsideLink
              :to="item.url"
              :params="item.params"
              :ignoreParams="item.ignoreParams"
              :class="item.classes"
              :opened="notCollapsedItems[item.id]"
              :tooltipText="$t(item.title)"
              :icon="item.icon"
              :chevron="!!item.items"
              :data-test-id="`aside-level-0-${index}`"
              @click-section="onClickSection(item)"
            >
              {{ $t(item.title) }}
            </AsideLink>

            <SubMenu
              v-if="item.items"
              :item="item"
              :notCollapsedItems="notCollapsedItems"
              @toggle-collapse="onToggleCollapse"
              @click-section="onClickSection"
            />
          </div>
        </template>
      </app-scroll-shadow>

      <div class="aside-footer">
        <AsideLinkProfile />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-aside__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1700;
  user-select: none;

  &.--collapsed {
    .toggle-mini__icon {
      transform: rotate(180deg);
    }
  }
}

.app-aside {
  z-index: 50;
  position: relative;
  height: 100%;
  width: var(--app-sidebar-width);
  max-width: var(--app-sidebar-width);
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  will-change: width;
  font-size: var(--text-xs);
  transition:
    width var(--app-sidebar-transition),
    max-width var(--app-sidebar-transition),
    left var(--app-sidebar-transition);

  &.--collapsed {
    width: var(--app-sidebar-width-mini);
    max-width: var(--app-sidebar-width-mini);
    overflow: visible;
  }

  .aside-footer {
    margin-top: auto;
    border-top: 1px solid var(--divider-color);
    padding-top: var(--space-1);
    padding-bottom: var(--space-0-5);

    .aside-profile {
      padding: var(--space-0-5) var(--space-1-5) var(--space-1);

      &__trigger {
        padding-top: var(--space-2);
        padding-bottom: var(--space-2);

        &:hover {
          border-color: var(--divider-color);
          background: rgba(255, 255, 255, 0.03);
        }
      }
    }
  }
}

.aside-menu {
  &__item {
    position: relative;

    ~ .app-spacer {
      padding-top: var(--space-1);
    }
  }

  &.app-scroll-shadow {
    overflow: hidden auto;
    padding-top: var(--space-2);
    padding-bottom: var(--space-0-5);

    &.--collapsed {
      overflow: visible;
    }

    // используем flex для того, чтобы прижать кнопку с изменением темы внизу,
    // но мы не можем использовать flex в мини, т.к. из-за flex-direction получается неправильное
    // позиционирование подменю (--popup), поэтому в мини будем прижимать кнопку через position,
    // основываясь на высоте экрана
    &:not(.--collapsed) {
      display: flex;
      flex-direction: column;
      flex: 1;

      > * {
        flex: 0 0 auto;
      }

      .aside-change-theme {
        margin-top: auto;
      }
    }
    @media (min-height: 804px) {
      &.--collapsed {
        .aside-change-theme {
          position: absolute;
          bottom: 2.875rem;
        }
      }
    }
  }
}

@media (max-height: 540px), (max-width: 768px) {
  .app-aside__wrapper {
    width: 0;

    &.--shadow-mobile-opened {
      width: 100%;
    }

    &:not(.--shadow-mobile-opened) {
      transition: width 0s ease var(--app-sidebar-transition-duration); // задержка для плавного исчезновения aside-shadow
    }

    .app-aside {
      position: absolute;
      width: var(--app-sidebar-width);

      .aside-link {
        &__text {
          font-size: var(--text-sm);
        }
      }

      .aside-manager {
        &__name {
          font-size: var(--text-sm);
          margin-top: var(--space-4);
        }

        &__contact-item-text {
          font-size: var(--text-xs);
        }
      }
    }

    @keyframes fadeInAsideLeft {
      from {
        left: calc(var(--app-sidebar-width) * -1);
      }
      to {
        left: 0;
      }
    }

    @keyframes fadeInAsideRight {
      from {
        right: calc(var(--app-sidebar-width) * -1);
      }
      to {
        right: 0;
      }
    }

    @keyframes fadeOutAsideLeft {
      from {
        left: 0;
      }
      to {
        left: calc(var(--app-sidebar-width) * -1);
      }
    }

    @keyframes fadeOutAsideRight {
      from {
        right: 0;
      }
      to {
        right: calc(var(--app-sidebar-width) * -1);
      }
    }
  }
}

// делаем кастомный скролл ещё тоньше, special for .aside-menu
.layout-scrollbar-obtrusive {
  .aside-menu.--custom-css-scrollbar::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
}
.aside-menu.--custom-css-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 9px;
  border: 0px;
}

// Если боковое меню свернуто в полоску, то делаем ширину скролла равной 0
.layout-scrollbar-obtrusive {
  .aside-menu.--collapsed.--custom-css-scrollbar::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

html.light {
  .aside-footer.--app-scroll-shadow-bottom {
    border-color: transparent;
  }
}
</style>
