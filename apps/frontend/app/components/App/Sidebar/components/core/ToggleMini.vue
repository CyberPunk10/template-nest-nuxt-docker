<script setup lang="ts">
import { useSidebar } from '../../composables/useSidebar'

const emit = defineEmits(['toggle-sidebar-width'])
const { isCollapsed } = useSidebar()
</script>

<template>
  <button
    v-tippy="isCollapsed ? $t('sidebar.expand') : $t('sidebar.collapse')"
    class="toggle-mini"
    :aria-label="isCollapsed ? $t('sidebar.expand') : $t('sidebar.collapse')"
    @click="emit('toggle-sidebar-width')"
  >
    <Icon
      :name="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
      class="toggle-mini__icon"
      size="16"
    />
  </button>
</template>

<style lang="scss">
.toggle-mini {
  z-index: 100;
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
  color: var(--text-tertiary-color);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--text-primary-color);
  }

  &__icon {
    flex-shrink: 0;
  }
}
</style>
