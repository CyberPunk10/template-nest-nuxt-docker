<script setup lang="ts">
import { useSidebar } from '../../composables/useSidebar'

const emit = defineEmits(['click'])
const { isDrawerOpen } = useSidebar()
</script>

<template>
  <div
    class="sidebar-shadow"
    :class="{ '--drawer-open': isDrawerOpen }"
    @click.self="emit('click')"
  />
</template>

<style lang="scss">
.sidebar-shadow {
  position: fixed;
  inset: 0;
  background: transparent;
  pointer-events: none;
  transition:
    opacity var(--app-sidebar-transition),
    background-color var(--app-sidebar-transition);

  &.--drawer-open {
    background: rgba(0, 0, 0, 0.2);
    pointer-events: auto;
  }

  /* drawer существует только ниже lg */
  @include media-up(lg) {
    display: none;
  }
}
</style>
