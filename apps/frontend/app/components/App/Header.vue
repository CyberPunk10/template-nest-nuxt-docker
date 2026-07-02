<script setup lang="ts">
import UserMenu from '~/components/App/Sidebar/components/UserMenu/index.vue'

const route = useRoute()

const title = computed(() => route.meta.title as string | undefined)
</script>

<template>
  <header class="app-header">
    <span v-if="title" class="app-header__title">{{ $t(title) }}</span>
    <span v-else class="app-header__title --missing">
      missing route.meta.title
    </span>

    <div class="app-header__right">
      <UserMenu />
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
  padding: 0 var(--space-4);

  @media (width > 1024px) {
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

    &.--missing {
      color: var(--status-warning);
      font-weight: var(--font-normal);
    }
  }

  &__right {
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>
