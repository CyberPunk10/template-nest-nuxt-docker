<script setup lang="ts">
import { MENU_TYPE, useSidebar } from '../composables/useSidebar'
import { themeSwither, type SidebarItem } from '../config/sidebar-menu'
import SidebarLink from './core/SidebarLink.vue'
import SubMenu from './core/SubMenu.vue'

withDefaults(defineProps<{
  notCollapsedItems?: Record<string, boolean>
}>(), {
  notCollapsedItems: () => ({}),
})

const emit = defineEmits<{
  'toggle-collapse': [item: unknown, val?: boolean]
  'click-section': [item: unknown]
}>()

const { isCollapsed, menuType } = useSidebar()
const colorMode = useColorMode()

const selectedTheme = computed(() => {
  const found = themeSwither.items?.find(i => i.id === colorMode.preference)
  return found?.title ?? 'themes.light'
})
const selectedThemeIcon = computed(
  () => themeSwither.items?.find(i => i.id === colorMode.preference)?.icon ?? 'light-theme',
)

function clickSubSection(subitem: unknown) {
  emit('click-section', subitem)
  setTheme((subitem as { id: string }).id)
}

function setTheme(value: string) {
  const newTheme = value || (colorMode.value === 'light' ? 'dark' : 'light')
  if (colorMode.preference === newTheme) return
  colorMode.preference = newTheme
}

function onClickOutsideSubMenu(itemWithSubMenu: SidebarItem) {
  if (itemWithSubMenu.id === themeSwither.id) {
    emit('toggle-collapse', itemWithSubMenu, false)
  }
}
</script>

<template>
  <div class="sidebar-change-theme__wrap">
    <SubMenu
      class="sidebar-change-theme__menu"
      :class="{ '--sidebar-collapsed': isCollapsed }"
      :forcePopup="menuType === MENU_TYPE.DESKTOP"
      :item="themeSwither"
      :notCollapsedItems="notCollapsedItems"
      @toggle-collapse="$emit('toggle-collapse', $event)"
      @click-section="clickSubSection"
      @click-outside-submenu="onClickOutsideSubMenu"
    />

    <SidebarLink
      class="sidebar-change-theme"
      :icon="selectedThemeIcon"
      :tooltipText="$t(selectedTheme)"
      @click-section="$emit('click-section', themeSwither)"
    >
      {{ $t(selectedTheme) }}
    </SidebarLink>
  </div>
</template>

<style lang="scss">
.app-sidebar {
  .sidebar-change-theme {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;

    .sidebar-link__icon {
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 1.25rem;
    }

    &__wrap {
      margin-top: auto;
    }

    &__menu {
      .sidebar-link__icon {
        width: 1.25rem;
        height: 1.25rem;
        flex: 0 0 1.25rem;
      }
    }
  }
}

// style for mobile right
.app-sidebar__wrapper.--right {
  .app-sidebar {
    .sidebar-change-theme {
      &__menu {
        .sidebar-link {
          padding-left: var(--space-2);
        }
      }
    }
  }
}

// style for desktop
.app-sidebar__wrapper:not(.--right) {
  .app-sidebar {
    .sidebar-change-theme {
      &__menu {
        &.--popup {
          position: fixed;
          top: auto;
          bottom: 3.1875rem;
          transform: scale(0.95);

          &.--show-sub-menu {
            transform: scale(1);
          }

          &:not(.--sidebar-collapsed) {
            left: calc(var(--app-sidebar-width) + var(--space-2));
          }

          .sidebar-dropdown__header {
            display: none;
          }
        }
      }
    }
  }
}
</style>
