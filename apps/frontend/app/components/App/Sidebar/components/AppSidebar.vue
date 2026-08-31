<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useSidebar } from '../composables/useSidebar'
import { useMenu, type MenuItem } from '../composables/useMenu'
import SidebarLink from './core/SidebarLink.vue'
import UserMenu from '~/components/App/UserMenu/index.vue'
import SidebarLogo from './SidebarLogo.vue'
import SidebarShadow from './core/SidebarShadow.vue'
import SubMenu from './core/SubMenu.vue'
import SidebarToggle from './core/SidebarToggle.vue'

const {
  isDrawerMode,
  isDrawerOpen,
  isCollapsed,
  toggleCollapsed,
  toggleDrawer,
} = useSidebar()

const { isLocked: isScrollLocked } = useBodyScrollLock()

const onClickOutsideRef = ref<HTMLElement | null>(null)

const triggerScrollHandler = ref(false)
const notCollapsedItems = ref<Record<string, boolean>>({})

const { sidebarMenu } = useMenu()
const menu = computed((): MenuItem[] => [...sidebarMenu.value])

// при переключении layout компонент монтируется заново — закрываем drawer,
// иначе он останется открытым от предыдущего layout
onMounted(() => toggleDrawer(false))

// вне drawer сайдбар не перекрывает контент — блокировать скролл незачем
watchEffect(() => {
  isScrollLocked.value = isDrawerOpen.value && isDrawerMode.value
})

function onToggleCollapse({ id, value = false }: { id: string, value?: boolean }) {
  if (!id) return
  notCollapsedItems.value[id] = value
  triggerScrollHandler.value = !triggerScrollHandler.value
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
    toggleDrawer(false)
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
    if (!isCollapsed.value) return
    resetCollapsed()
  })
}

function clickByShadow() {
  toggleDrawer(false)
}

function resetCollapsed() {
  Object.keys(notCollapsedItems.value).forEach((id) => {
    notCollapsedItems.value[id] = false
  })
}

function toggleSideBarWidth() {
  resetCollapsed()
  toggleCollapsed()
}
</script>

<template>
  <div
    ref="onClickOutsideRef"
    class="app-sidebar__wrapper"
    :class="{
      '--drawer-open': isDrawerOpen,
      '--collapsed': isCollapsed,
    }"
  >
    <SidebarShadow @click="clickByShadow" />

    <SidebarToggle
      @toggle-sidebar-width="toggleSideBarWidth"
    />

    <div
      class="app-sidebar"
      :class="{ '--collapsed': isCollapsed }"
    >
      <SidebarLogo />

      <app-scroll-shadow
        class="sidebar-menu"
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
    transform var(--app-sidebar-transition);

  &.--collapsed {
    width: var(--app-sidebar-width-collapsed);
    max-width: var(--app-sidebar-width-collapsed);
    overflow: visible;

    .sidebar-link__text,
    .sidebar-link__chevron,
    .user-menu__info,
    .user-menu__chevron {
      opacity: 0;
    }

    .sidebar-dropdown {
      .sidebar-link__text,
      .sidebar-link__chevron {
        opacity: 1;
      }
    }

    .logo__text {
      max-width: 0;
      opacity: 0;
    }

    .sidebar-menu.app-scroll-shadow {
      overflow: visible;
    }
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

    .app-sidebar.--collapsed & {
      overflow: visible;
    }

    .app-sidebar:not(.--collapsed) & {
      display: flex;
      flex-direction: column;
      flex: 1;

      > * {
        flex: 0 0 auto;
      }
    }
  }
}

@media (max-width: 1024px) {
  .app-sidebar__wrapper {
    width: 0;

    /* обёртка растягивается на весь экран, чтобы подложка перехватывала клики */
    &.--drawer-open {
      width: 100%;
    }

    &:not(.--drawer-open) {
      transition: width 0s ease var(--app-sidebar-transition-duration); // задержка для плавного исчезновения sidebar-shadow
    }

    .app-sidebar {
      position: absolute;
      transform: translateX(-100%);
      overflow: hidden;
    }

    &.--drawer-open .app-sidebar {
      overflow: hidden auto;
      transform: translateX(0);
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

html.light {
  .sidebar-footer.--app-scroll-shadow-bottom {
    border-color: transparent;
  }
}
</style>
