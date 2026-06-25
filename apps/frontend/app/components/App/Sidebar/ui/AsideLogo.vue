<script>
import { MENU_TYPE } from '~/composables/useSidebar'

export default {
  components: {
    AppLogo: defineAsyncComponent(() => import('~/components/App/Logo.vue')),
  },
  setup() {
    const { isCollapsed, menuType } = useSidebar()
    const { $globalEvents } = useNuxtApp()
    return {
      MENU_TYPE,
      isCollapsed,
      menuType,
      $globalEvents,
    }
  },
}
</script>

<template>
  <!--
    оборачиваем в пустой div, т.к. без обертки в мобильной версии в левом меню
    показывается только часть тени, которая автоматически добавляется из app-scroll-shadow
  -->
  <div class="aside-logo-and-btn-close">
    <button
      v-if="menuType !== MENU_TYPE.DESKTOP"
      class="aside-close"
      @click="$globalEvents.emit('toggle-sidebar', { value: false })"
    >
      <Icon name="lucide:x" />
    </button>

    <AppLogo
      class="aside-logo"
      :collapsed="isCollapsed"
      @click="$globalEvents.emit('toggle-sidebar', { value: false })"
    />
  </div>
</template>

<style lang="scss">
.aside-logo-and-btn-close {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: var(--app-header-height);
  padding: 0 var(--space-3-5);
  border-bottom: 1px solid var(--divider-color);

  .aside-close {
    font-size: 0.75rem !important;
    z-index: 20;
    color: var(--leadgid-color);
  }

  .aside-close {
    margin-left: var(--space-2);
    margin-right: var(--space-1);
  }
}

.aside-logo {
  svg {
    height: 1.5rem;
  }
}

html.light {
  .aside-logo-and-btn-close.--app-scroll-shadow-top {
    border-color: transparent;
  }
}
</style>
