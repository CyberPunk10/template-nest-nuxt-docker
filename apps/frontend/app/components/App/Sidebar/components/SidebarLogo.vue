<script setup lang="ts">
import { MENU_TYPE, useSidebar } from '../composables/useSidebar'
import AppLogo from '~/components/App/Logo.vue'

const { isCollapsed, menuType } = useSidebar()
const { $globalEvents } = useNuxtApp()
</script>

<template>
  <!--
    оборачиваем в пустой div, т.к. без обертки в мобильной версии в левом меню
    показывается только часть тени, которая автоматически добавляется из app-scroll-shadow
  -->
  <div class="sidebar-logo-and-btn-close">
    <button
      v-if="menuType !== MENU_TYPE.DESKTOP"
      class="sidebar-close"
      @click="$globalEvents.emit('toggle-sidebar', { value: false })"
    >
      <Icon name="lucide:x" />
    </button>

    <AppLogo
      class="sidebar-logo"
      :collapsed="isCollapsed"
      @click="$globalEvents.emit('toggle-sidebar', { value: false })"
    />
  </div>
</template>

<style lang="scss">
.sidebar-logo-and-btn-close {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: var(--app-header-height);
  padding: 0 var(--space-3-5);
  border-bottom: 1px solid var(--border-subtle);

  .sidebar-close {
    font-size: 0.75rem !important;
    z-index: var(--z-raised);
    color: var(--leadgid-color);
  }

  .sidebar-close {
    margin-left: var(--space-2);
    margin-right: var(--space-1);
  }
}

.sidebar-logo {
  svg {
    height: 1.5rem;
  }
}

html.light {
  .sidebar-logo-and-btn-close.--app-scroll-shadow-top {
    border-color: transparent;
  }
}
</style>
