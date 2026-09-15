<script setup lang="ts">
import UserMenu from '~/components/App/UserMenu/index.vue'
import SidebarOpenButton from '~/components/App/SidebarOpenButton.vue'

const route = useRoute()

const title = computed(() => route.meta.title as string | undefined)
</script>

<template>
  <header class="app-header">
    <SidebarOpenButton />

    <span v-if="title" class="app-header__title">{{ $t(title) }}</span>

    <div class="app-header__right">
      <UserMenu context="header" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--app-header-height);
  background: var(--surface-panel);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-2-5);

  @include media-up(lg) {
    display: none;
  }

  &__title {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__right {
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>
