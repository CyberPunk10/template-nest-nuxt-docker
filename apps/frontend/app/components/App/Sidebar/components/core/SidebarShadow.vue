<script setup lang="ts">
const emit = defineEmits(['click'])
const { isMobileOpen } = useSidebar()
</script>

<template>
  <div
    class="aside-shadow"
    :class="{ '--shadow-mobile-opened': isMobileOpen }"
    data-test-id="shadow"
    @click.self="emit('click')"
  />
</template>

<style lang="scss">
.aside-shadow {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background: transparent;
  transition:
    left var(--app-sidebar-transition),
    height var(--app-sidebar-transition),
    width var(--app-sidebar-transition),
    opacity var(--app-sidebar-transition),
    background-color var(--app-sidebar-transition);

  &.--shadow-mobile-opened {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
