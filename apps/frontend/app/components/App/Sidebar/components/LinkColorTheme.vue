<script>
import { MENU_TYPE } from '~/composables/useSidebar'
import { themeSwither } from '../config/sidebar-menu'

import SidebarLink from '~/components/App/Sidebar/components/core/SidebarLink.vue'
import SubMenu from '~/components/App/Sidebar/components/core/SubMenu.vue'

export default {
  components: {
    SidebarLink,
    SubMenu,
  },
  props: {
    notCollapsedItems: Object,
  },
  emits: ['toggle-collapse', 'click-section'],
  setup(props, { emit }) {
    const { isCollapsed, menuType } = useSidebar()
    const colorMode = useColorMode()

    const isDarkTheme = computed(() => colorMode.value === 'dark')
    const selectedTheme = computed(() => {
      const found = themeSwither.items?.find(i => i.id === colorMode.preference)
      return found?.title ?? 'themes.light'
    })
    const selectedThemeIcon = computed(
      () => themeSwither.items?.find(i => i.id === colorMode.preference)?.icon ?? 'light-theme',
    )

    function clickSubSection(subitem) {
      emit('click-section', subitem)
      setTheme(subitem.id)
    }

    function setTheme(value) {
      const newTheme = value || (colorMode.value === 'light' ? 'dark' : 'light')
      if (colorMode.preference === newTheme) return
      colorMode.preference = newTheme
    }

    function onClickOutsideSubMenu(itemWithSubMenu) {
      if (itemWithSubMenu.id === themeSwither.id) {
        emit('toggle-collapse', itemWithSubMenu, false)
      }
    }

    return {
      MENU_TYPE,
      isCollapsed,
      menuType,
      clickSubSection,
      isDarkTheme,
      onClickOutsideSubMenu,
      selectedTheme,
      selectedThemeIcon,
      setTheme,
      themeSwither,
    }
  },
}
</script>

<template>
  <div class="aside-change-theme__wrap">
    <SubMenu
      class="aside-change-theme__menu"
      :class="{ '--aside-collapsed': isCollapsed }"
      :forcePopup="menuType === MENU_TYPE.DESKTOP"
      :item="themeSwither"
      :notCollapsedItems="notCollapsedItems"
      @toggle-collapse="$emit('toggle-collapse', $event)"
      @click-section="clickSubSection"
      @click-outside-submenu="onClickOutsideSubMenu"
    />

    <SidebarLink
      class="aside-change-theme"
      :icon="selectedThemeIcon"
      :tooltipText="$t(selectedTheme)"
      data-test-id="aside-theme"
      @click-section="$emit('click-section', themeSwither)"
    >
      {{ $t(selectedTheme) }}
    </SidebarLink>
  </div>
</template>

<style lang="scss">
.app-aside {
  .aside-change-theme {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;

    .aside-link__icon {
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 1.25rem;
    }

    &__wrap {
      margin-top: auto;
    }

    &__menu {
      .aside-link__icon {
        width: 1.25rem;
        height: 1.25rem;
        flex: 0 0 1.25rem;
      }
    }
  }
}

// style for mobile right
.app-aside__wrapper.--right {
  .app-aside {
    .aside-change-theme {
      &__menu {
        .aside-link {
          padding-left: var(--space-2);
        }
      }
    }
  }
}

// style for desktop
.app-aside__wrapper:not(.--right) {
  .app-aside {
    .aside-change-theme {
      &__menu {
        &.--popup {
          position: fixed;
          top: auto;
          bottom: 3.1875rem;
          transform: scale(0.95);

          &.--show-sub-menu {
            transform: scale(1);
          }

          &:not(.--aside-collapsed) {
            left: calc(var(--app-sidebar-width) + var(--space-2));
          }

          .aside-dropdown__header {
            display: none;
          }
        }
      }
    }
  }
}
</style>
