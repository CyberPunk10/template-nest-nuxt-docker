<script setup lang="ts">
import { useSidebar } from '../composables/useSidebar'
import AppLogo from '~/components/App/Logo.vue'

const { toggleDrawer } = useSidebar()
</script>

<template>
  <!--
    оборачиваем в пустой div, т.к. без обертки в мобильной версии в левом меню
    показывается только часть тени, которая автоматически добавляется из app-scroll-shadow
  -->
  <div class="sidebar-logo-wrapper">
    <AppLogo
      class="sidebar-logo"
      @click="toggleDrawer(false)"
    />
  </div>
</template>

<style lang="scss">
.sidebar-logo-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: var(--app-header-height);
  padding: 0 var(--space-3-5);
  border-bottom: 1px solid var(--border-subtle);

  .sidebar-logo {
    svg {
      height: 1.5rem;
    }
  }
}

html.light {
  .sidebar-logo-wrapper.--app-scroll-shadow-top {
    border-color: transparent;
  }
}
</style>
