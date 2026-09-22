<script setup lang="ts">
import UserMenu from '~/components/App/UserMenu/index.vue'
import SidebarOpenButton from '~/components/App/SidebarOpenButton.vue'

const route = useRoute()

const title = computed(() => route.meta.title as string | undefined)

const hasHeader = computed(() => !route.meta.withoutHeader)
</script>

<template>
  <header
    class="app-header"
    :class="{ '--hidden': !hasHeader }"
  >
    <SidebarOpenButton />

    <span v-if="title" class="app-header__title">{{ $t(title) }}</span>

    <div class="app-header__right">
      <UserMenu context="header" />
    </div>
  </header>
</template>

<style scoped lang="scss">
@mixin app-header-hidden {
  margin-top: calc(-1 * var(--app-header-height));
  opacity: 0;
  visibility: hidden;
  transition:
    margin-top var(--app-header-transition),
    opacity var(--app-header-transition),
    visibility 0s linear var(--app-header-transition-duration);
}

.app-header {
  position: relative;
  z-index: var(--z-sticky);
  flex-shrink: 0;
  height: var(--app-header-height);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-2-5);
  background: var(--surface-panel);
  border-bottom: 1px solid var(--border-subtle);
  transition:
    margin-top var(--app-header-transition),
    opacity var(--app-header-transition),
    visibility 0s;

  // definePageMeta({ withoutHeader: true }).
  &.--hidden {
    @include app-header-hidden;
  }

  // desktop
  @include media-up(lg) {
    @include app-header-hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
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
