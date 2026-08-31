<script setup lang="ts">
import { useSidebar } from '../../composables/useSidebar'

const emit = defineEmits(['toggle-sidebar-width'])

const { t } = useI18n()
const {
  isCollapsed,
  isDrawerMode,
  isDrawerOpen,
  toggleDrawer,
} = useSidebar()

const isInlineShown = computed(() => !isCollapsed.value)

const isShown = computed(() => (isDrawerMode.value ? isDrawerOpen.value : isInlineShown.value))

const icon = (shown: boolean) => (shown ? 'lucide:panel-left-close' : 'lucide:panel-left-open')

const label = computed(() => (isShown.value ? t('sidebar.collapse') : t('sidebar.expand')))

function handleClick() {
  if (isDrawerMode.value) toggleDrawer()
  else emit('toggle-sidebar-width')
}
</script>

<template>
  <button
    v-tippy="isDrawerMode ? '' : label"
    class="sidebar-toggle"
    :aria-label="label"
    :aria-expanded="isShown"
    @click="handleClick"
  >
    <Icon
      :key="icon(isDrawerOpen)"
      :name="icon(isDrawerOpen)"
      class="sidebar-toggle__icon --drawer"
      size="18"
    />
    <Icon
      :key="icon(isInlineShown)"
      :name="icon(isInlineShown)"
      class="sidebar-toggle__icon --inline"
      size="18"
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

    &.--drawer {
      display: none;

      @media (width <= 1024px) {
        display: block;
      }
    }

    &.--inline {
      @media (width <= 1024px) {
        display: none;
      }
    }
  }
}
</style>
