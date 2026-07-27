<script setup lang="ts">
import { MENU_TYPE, useSidebar } from '../../composables/useSidebar'

const emit = defineEmits(['toggle-sidebar-width'])

const { $globalEvents } = useNuxtApp()
const { t } = useI18n()
const { isCollapsed, isMobileOpen, menuType } = useSidebar()

const isDesktop = computed(() => menuType.value === MENU_TYPE.DESKTOP)

// единый паттерн для десктопа и мобилки: одна кнопка-панель,
// иконка отражает текущее состояние (скрыто → open, видно → close)
const isShown = computed(() => (isDesktop.value ? !isCollapsed.value : isMobileOpen.value))

const iconName = computed(() =>
  isShown.value ? 'lucide:panel-left-close' : 'lucide:panel-left-open',
)

const label = computed(() => (isShown.value ? t('sidebar.collapse') : t('sidebar.expand')))

function handleClick() {
  if (isDesktop.value) {
    emit('toggle-sidebar-width')
  } else {
    $globalEvents.emit('toggle-sidebar', {})
  }
}
</script>

<template>
  <button
    v-tippy="isDesktop ? label : ''"
    class="sidebar-toggle"
    :aria-label="label"
    :aria-expanded="isShown"
    @click="handleClick"
  >
    <Icon
      :key="iconName"
      :name="iconName"
      class="sidebar-toggle__icon"
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
  }
}
</style>
