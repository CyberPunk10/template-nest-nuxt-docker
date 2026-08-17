<script setup lang="ts">
import { onClickOutside, useWindowSize } from '@vueuse/core'
import { APP_BREAKPOINTS } from '~/composables/useAppBreakpoints'
import { MENU_TYPE, useSidebar, type MenuType } from '../composables/useSidebar'
import { useMenu, type MenuItem } from '../composables/useMenu'
import type ScrollShadow from '~/components/App/ScrollShadow.vue'
import SidebarLink from './core/SidebarLink.vue'
import UserMenu from '~/components/App/UserMenu/index.vue'
import SidebarLogo from './SidebarLogo.vue'
import SidebarShadow from './core/SidebarShadow.vue'
import SubMenu from './core/SubMenu.vue'
import SidebarToggle from './core/SidebarToggle.vue'

const { $globalEvents } = useNuxtApp()
const { width } = useWindowSize({ initialWidth: 0, initialHeight: 0 })

const { isCollapsed, isMobileOpen, menuType } = useSidebar()

const sidebarRef = ref<HTMLElement | null>(null)
const sidebarScrollRef = ref<InstanceType<typeof ScrollShadow> | null>(null)
const onClickOutsideRef = ref<HTMLElement | null>(null)

const isSidebarDesktop = computed(() => menuType.value === MENU_TYPE.DESKTOP)
const triggerScrollHandler = ref(false)
const notCollapsedItems = ref<Record<string, boolean>>({})

const { sidebarMenu } = useMenu()
const menu = computed((): MenuItem[] => [...sidebarMenu.value])

watch(width, () => updateSidebarState())

function updateSidebarState(isInit = false) {
  if (isInit) {
    // при переключении между разными layout повторно происходит загрузка компонента AppSidebar,
    // это закроет открытые меню в мобилке при переключении между layouts
    toggleSidebar({ value: false })
  }

  isCollapsed.value = width.value > APP_BREAKPOINTS.md && width.value <= APP_BREAKPOINTS.lg

  if (width.value > APP_BREAKPOINTS.lg) {
    menuType.value = MENU_TYPE.DESKTOP
    isMobileOpen.value = false
    $globalEvents.emit('body-overflow', false)
  } else {
    menuType.value = MENU_TYPE.MOBILE
  }
}

onMounted(() => {
  updateSidebarState(true)
  $globalEvents.on('toggle-sidebar', toggleSidebar)
  $globalEvents.on('collapse-sidebar', setCollapseFromEventBus)
})

onBeforeUnmount(() => {
  $globalEvents.off('toggle-sidebar', toggleSidebar)
  $globalEvents.off('collapse-sidebar', setCollapseFromEventBus)
})

function setCollapseFromEventBus({ id, value = false }: { id: string, value?: boolean }) {
  if (!id) return
  if (value) scrollSidebar()
  onClickSection({ id, value })
}

function onToggleCollapse({ id, value = false }: { id: string, value?: boolean }) {
  if (!id) return
  notCollapsedItems.value[id] = value
  triggerScrollHandler.value = !triggerScrollHandler.value
}

function scrollSidebar({ y = 0 }: { y?: number } = {}) {
  sidebarScrollRef.value?.appScrollShadowRef?.scrollTo({ top: y, behavior: 'smooth' })
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

function onClickSection({ id, value }: { id: string, value?: boolean }) {
  const section = getMenuItemById(id)

  if (!section?.items?.length) {
    $globalEvents.emit('toggle-sidebar', { value: false })
    if (isCollapsed.value) resetCollapsed()
    return
  }

  const resultValue = typeof value === 'boolean' ? value : !notCollapsedItems.value[id]
  resetCollapsed()

  // если меню вложенное, сначала раскрыть родительское
  if (section?.parent) onToggleCollapse({ id: section.parent.id, value: true })
  onToggleCollapse({ id, value: resultValue })
}

onClickOutside(onClickOutsideRef, onClickOutsideSidebar)

function onClickOutsideSidebar() {
  requestAnimationFrame(() => {
    if (!isCollapsed.value) {
      return
    }
    resetCollapsed()
  })
}

function clickByShadow() {
  toggleSidebar({ value: false })
}

function resetCollapsed() {
  Object.keys(notCollapsedItems.value).forEach((id) => {
    notCollapsedItems.value[id] = false
  })
}

function toggleSidebar({ value, type = menuType.value }: { value?: boolean, type?: MenuType }) {
  const newValue = typeof value === 'boolean' ? value : !isMobileOpen.value

  $globalEvents.emit('body-overflow', newValue)
  isMobileOpen.value = newValue

  if (!isSidebarDesktop.value) {
    let direction = 'left'
    if (type === MENU_TYPE.MOBILE) {
      direction = 'right'
    }

    const appSidebarEl = sidebarRef.value
    if (!appSidebarEl) {
      menuType.value = type
    } else if (!newValue) {
      appSidebarEl.style[direction as 'left' | 'right'] = '0'
      // После завершения анимации очищаем установленные стили
      setTimeout(() => {
        appSidebarEl.style[direction as 'left' | 'right'] = ''
        menuType.value = type
      }, 400)
    } else {
      appSidebarEl.style[direction as 'left' | 'right'] = 'calc(var(--app-sidebar-width) * -1)'
      menuType.value = type
      // После завершения анимации очищаем установленные стили
      setTimeout(() => {
        appSidebarEl.style[direction as 'left' | 'right'] = ''
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
    class="app-sidebar__wrapper"
    :class="{
      '--shadow-mobile-opened': isMobileOpen,
      '--collapsed': isCollapsed,
    }"
  >
    <SidebarShadow @click="clickByShadow" />

    <SidebarToggle
      @toggle-sidebar-width="toggleSideBarWidth"
    />

    <div
      ref="sidebarRef"
      class="app-sidebar"
      :class="{ '--collapsed': isCollapsed }"
    >
      <SidebarLogo />

      <app-scroll-shadow
        ref="sidebarScrollRef"
        class="sidebar-menu"
        :class="{
          '--collapsed': isCollapsed,
        }"
        :triggerScrollHandler="triggerScrollHandler"
        withoutIgnoreSwipe
      >
        <!-- Items menu -->
        <template v-for="(item, index) in menu" :key="`sidebar-item-${index}`">
          <app-spacer v-if="'spacer' in item" :data-spacer-id="item.id" />

          <div v-else class="sidebar-menu__item">
            <SidebarLink
              :to="item.url"
              :external="item.external"
              :newTab="item.newTab"
              :class="item.classes"
              :opened="notCollapsedItems[item.id!]"
              :tooltipText="$t(item.title)"
              :icon="item.icon"
              :chevron="!!item.items"
              @click-section="onClickSection({ id: item.id! })"
            >
              {{ $t(item.title) }}
            </SidebarLink>

            <SubMenu
              v-if="item.items"
              :item="item"
              :notCollapsedItems="notCollapsedItems"
              @toggle-collapse="onToggleCollapse"
              @click-section="onClickSection({ id: $event.id! })"
            />
          </div>
        </template>
      </app-scroll-shadow>

      <div class="sidebar-footer">
        <UserMenu />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-sidebar__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: var(--z-overlay);
  user-select: none;
}

.app-sidebar {
  z-index: var(--z-raised);
  position: relative;
  height: 100%;
  width: var(--app-sidebar-width);
  max-width: var(--app-sidebar-width);
  display: flex;
  flex-direction: column;
  background-color: var(--surface-panel);
  will-change: width;
  font-size: var(--text-xs);
  transition:
    width var(--app-sidebar-transition),
    max-width var(--app-sidebar-transition),
    left var(--app-sidebar-transition);

  &.--collapsed {
    width: var(--app-sidebar-width-collapsed);
    max-width: var(--app-sidebar-width-collapsed);
    overflow: visible;
  }

  .sidebar-footer {
    margin-top: auto;
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-1);
    padding-bottom: var(--space-0-5);

    .user-menu {
      padding: var(--space-0-5) var(--space-1-5) var(--space-1);

      &__trigger {
        padding-top: var(--space-2);
        padding-bottom: var(--space-2);

        &:hover {
          border-color: var(--border-subtle);
          background: rgba(255, 255, 255, 0.03);
        }
      }
    }
  }
}

.sidebar-menu {
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

    &:not(.--collapsed) {
      display: flex;
      flex-direction: column;
      flex: 1;

      > * {
        flex: 0 0 auto;
      }
    }
  }
}

@media (max-width: 768px) {
  .app-sidebar__wrapper {
    width: 0;

    &.--shadow-mobile-opened {
      width: 100%;
    }

    &:not(.--shadow-mobile-opened) {
      transition: width 0s ease var(--app-sidebar-transition-duration); // задержка для плавного исчезновения sidebar-shadow
    }

    .app-sidebar {
      position: absolute;
      width: var(--app-sidebar-width);

      .sidebar-link {
        &__text {
          font-size: var(--text-sm);
        }
      }

      .sidebar-manager {
        &__name {
          font-size: var(--text-sm);
          margin-top: var(--space-4);
        }

        &__contact-item-text {
          font-size: var(--text-xs);
        }
      }
    }

    @keyframes fadeInSidebarLeft {
      from {
        left: calc(var(--app-sidebar-width) * -1);
      }
      to {
        left: 0;
      }
    }

    @keyframes fadeInSidebarRight {
      from {
        right: calc(var(--app-sidebar-width) * -1);
      }
      to {
        right: 0;
      }
    }

    @keyframes fadeOutSidebarLeft {
      from {
        left: 0;
      }
      to {
        left: calc(var(--app-sidebar-width) * -1);
      }
    }

    @keyframes fadeOutSidebarRight {
      from {
        right: 0;
      }
      to {
        right: calc(var(--app-sidebar-width) * -1);
      }
    }
  }
}

// делаем кастомный скролл ещё тоньше, special for .sidebar-menu
.layout-scrollbar-obtrusive {
  .sidebar-menu.--custom-css-scrollbar::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
}
.sidebar-menu.--custom-css-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 9px;
  border: 0px;
}

// Если боковое меню свернуто в полоску, то делаем ширину скролла равной 0
.layout-scrollbar-obtrusive {
  .sidebar-menu.--collapsed.--custom-css-scrollbar::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

html.light {
  .sidebar-footer.--app-scroll-shadow-bottom {
    border-color: transparent;
  }
}
</style>
