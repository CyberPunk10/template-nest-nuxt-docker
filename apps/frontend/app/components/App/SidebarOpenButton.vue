<script setup lang="ts">
import { useSidebar } from './Sidebar/composables/useSidebar'

const { isDrawerOpen, toggleDrawer } = useSidebar()
</script>

<template>
  <button
    v-tippy="{ content: $t('sidebar.expand'), placement: 'bottom' }"
    class="sidebar-open-button"
    :aria-label="$t('sidebar.expand')"
    :aria-expanded="isDrawerOpen"
    @click="toggleDrawer(true)"
  >
    <Icon name="lucide:panel-left-open" size="18" />
  </button>
</template>

<style lang="scss">
.sidebar-open-button {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background-color 0.1s,
    color 0.1s;

  &:hover {
    background-color: var(--control-hover);
    color: var(--text-primary);
  }
}
</style>
