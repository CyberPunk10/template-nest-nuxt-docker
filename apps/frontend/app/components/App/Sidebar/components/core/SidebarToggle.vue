<script setup lang="ts">
import { useSidebar } from '../../composables/useSidebar'

const emit = defineEmits(['toggle-sidebar-width'])
const { isCollapsed } = useSidebar()
</script>

<template>
  <button
    v-tippy="isCollapsed ? $t('sidebar.expand') : $t('sidebar.collapse')"
    class="sidebar-toggle"
    :aria-label="isCollapsed ? $t('sidebar.expand') : $t('sidebar.collapse')"
    @click="emit('toggle-sidebar-width')"
  >
    <Icon
      :name="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
      class="sidebar-toggle__icon"
      size="16"
    />
  </button>
</template>

<style lang="scss">
.sidebar-toggle {
  z-index: var(--z-dropdown);
  position: absolute;
  top: 0.75rem;
  right: -2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-lg);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--text-primary);
  }

  &__icon {
    flex-shrink: 0;
  }
}
</style>
