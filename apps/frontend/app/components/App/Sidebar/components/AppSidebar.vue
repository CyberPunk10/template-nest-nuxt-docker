<script setup lang="ts">
import { onClickOutside, useWindowSize } from '@vueuse/core'
import { APP_BREAKPOINTS } from '~/composables/useAppBreakpoints'
import { MENU_TYPE, useSidebar, type MenuType } from '../composables/useSidebar'
import { useMenu, type MenuItem } from '../composables/useMenu'
import { themeSwither } from '../config/sidebar-menu'
import type ScrollShadow from '~/components/App/ScrollShadow.vue'
import SidebarLink from './core/SidebarLink.vue'
import LinkProfile from './LinkProfile/index.vue'
import SidebarLogo from './SidebarLogo.vue'
import SidebarShadow from './core/SidebarShadow.vue'
import SubMenu from './core/SubMenu.vue'
import ToggleMini from './core/ToggleMini.vue'

const { $globalEvents } = useNuxtApp()
const { width, height } = useWindowSize({ initialWidth: 0, initialHeight: 0 })

const { isCollapsed, isMobileOpen, menuType } = useSidebar()

const asideRef = ref<HTMLElement | null>(null)
const asideScrollRef = ref<InstanceType<typeof ScrollShadow> | null>(null)
const onClickOutsideRef = ref<HTMLElement | null>(null)

const isAsideDesktop = computed(() => menuType.value === MENU_TYPE.DESKTOP)
const triggerScrollHandler = ref(false)
const notCollapsedItems = ref<Record<string, boolean>>({})

const { leftMenu, rightMenu } = useMenu()
const menu = computed((): MenuItem[] => [...leftMenu.value, ...rightMenu.value])

watch(width, () => updateAsideState())

function updateAsideState(isInit = false) {
  if (isInit) {
    // при переключении между разными layout повторно происходит загрузка компонента Aside,
    // это закроет открытые меню в мобилке при переключении между layouts
    toggleAside({ value: false })
  }

  isCollapsed.value = width.value > APP_BREAKPOINTS.tablet
    && width.value <= APP_BREAKPOINTS.desktop
    && height.value > APP_BREAKPOINTS.mobile

  if (width.value > APP_BREAKPOINTS.tablet && height.value > APP_BREAKPOINTS.mobile) {
    menuType.value = MENU_TYPE.DESKTOP
    isMobileOpen.value = false
    $globalEvents.emit('body-overflow', false)
  } else {
    menuType.value = menuType.value === MENU_TYPE.MOBILE_RIGHT
      ? MENU_TYPE.MOBILE_RIGHT
      : MENU_TYPE.MOBILE_LEFT
  }
}

onMounted(() => {
  updateAsideState(true)
  $globalEvents.on('toggle-sidebar', toggleAside)
  $globalEvents.on('collapse-sidebar', setCollapseFromEventBus)
})

onBeforeUnmount(() => {
  $globalEvents.off('toggle-sidebar', toggleAside)
  $globalEvents.off('collapse-sidebar', setCollapseFromEventBus)
})

function setCollapseFromEventBus({ id, value = false }: { id: string, value?: boolean }) {
  if (!id) return
  if (value) scrollAside()
  onClickSection({ id, value })
}

function onToggleCollapse({ id, value = false }: { id: string, value?: boolean }) {
  if (!id) return
  notCollapsedItems.value[id] = value
  triggerScrollHandler.value = !triggerScrollHandler.value
}

function scrollAside({ y = 0 }: { y?: number } = {}) {
  asideScrollRef.value?.appScrollShadowRef?.scrollTo({ top: y, behavior: 'smooth' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMenuItemById(id: string, items = menu.value, parent: any = null): any {
  for (const item of items) {
    if (item.id === id) return { ...item, parent }
    if ('items' in item && item.items?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nested = getMenuItemById(id, item.items as any, item)
      if (nested) return nested
    }
  }
  return null
}

function getSectionById(id: string) {
  let section
  if (id === themeSwither.id) section = themeSwither
  else section = getMenuItemById(id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!section) section = getMenuItemById(id, themeSwither.items as any, themeSwither)
  return section
}

function onClickSection({ id, value }: { id: string, value?: boolean }) {
  const section = getSectionById(id)

  if (!section?.items?.length) {
    const isThemeSwitherChild = section?.parent?.id === themeSwither.id
    $globalEvents.emit('toggle-sidebar', { value: false })
    if (isCollapsed.value || isThemeSwitherChild) resetCollapsed()
    return
  }

  if (!id) return

  const resultValue = typeof value === 'boolean' ? value : !notCollapsedItems.value[id]
  resetCollapsed()

  // если меню вложенное, сначала раскрыть родительское
  if (section?.parent) onToggleCollapse({ id: section.parent.id, value: true })
  onToggleCollapse({ id, value: resultValue })
}

onClickOutside(onClickOutsideRef, onClickOutsideAside)

function onClickOutsideAside() {
  requestAnimationFrame(() => {
    if (!isCollapsed.value) {
      if (menuType.value === MENU_TYPE.DESKTOP) {
        notCollapsedItems.value[themeSwither.id] = false
      }
      return
    }
    resetCollapsed()
  })
}

function clickByShadow() {
  toggleAside({ value: false })
}

function resetCollapsed() {
  Object.keys(notCollapsedItems.value).forEach((id) => {
    notCollapsedItems.value[id] = false
  })
}

function toggleAside({ value, type = menuType.value }: { value?: boolean, type?: MenuType }) {
  const newValue = typeof value === 'boolean' ? value : !isMobileOpen.value

  $globalEvents.emit('body-overflow', newValue)
  isMobileOpen.value = newValue

  if (!isAsideDesktop.value) {
    let direction = 'left'
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
      appAsideEl.style[direction as 'left' | 'right'] = '0'
      // После завершения анимации очищаем установленные стили
      setTimeout(() => {
        appAsideEl.style[direction as 'left' | 'right'] = ''
        menuType.value = type
      }, 400)
    } else {
      appAsideEl.style[direction as 'left' | 'right'] = 'calc(var(--app-sidebar-width) * -1)'
      menuType.value = type
      // После завершения анимации очищаем установленные стили
      setTimeout(() => {
        appAsideEl.style[direction as 'left' | 'right'] = ''
      }, 400)
    }
  }
}

function toggleSideBarWidth() {
  resetCollapsed()
  requestAnimationFrame(() => {
    isCollapsed.value = !isCollapsed.value
  })
}
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
    <SidebarShadow @click="clickByShadow" />

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
      <SidebarLogo />

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
        <template v-for="(item, index) in menu" :key="`aside-item-${index}`">
          <app-spacer v-if="'spacer' in item" :data-spacer-id="item.id" />

          <div v-else class="aside-menu__item">
            <SidebarLink
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
            </SidebarLink>

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
        <LinkProfile />
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
