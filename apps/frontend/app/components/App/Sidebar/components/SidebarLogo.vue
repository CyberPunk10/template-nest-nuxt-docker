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

    <button
      class="sidebar-close"
      :aria-label="$t('sidebar.collapse')"
      @click="toggleDrawer(false)"
    >
      <Icon name="lucide:x" size="18" />
    </button>
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

  .sidebar-close {
    display: none;
    margin-left: auto;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: var(--text-primary);
    }

    @include media-down(xs) {
      display: flex;
    }
  }
}

html.light {
  .sidebar-logo-wrapper.--app-scroll-shadow-top {
    border-color: transparent;
  }
}
</style>
