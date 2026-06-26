<script setup lang="ts">
import { themeSwither } from '../../config/sidebar-menu'

defineProps<{ show: boolean }>()

defineEmits<{ open: [], close: [] }>()

const ICON_MAP: Record<string, string> = {
  'light-theme': 'lucide:sun',
  'dark-theme': 'lucide:moon',
  'system-theme': 'lucide:monitor',
  'dark-green-theme': 'lucide:leaf',
  'dark-midnight-theme': 'lucide:github',
  'dark-ocean-theme': 'lucide:waves',
}

const colorMode = useColorMode()
const { t } = useI18n()

const selectedTheme = computed(() => themeSwither.items?.find(i => i.id === colorMode.preference))

function setTheme(id: string) {
  if (colorMode.preference === id) return
  colorMode.preference = id
}
</script>

<template>
  <div
    class="sidebar-profile__theme-trigger"
    @mouseenter="$emit('open')"
    @mouseleave="$emit('close')"
  >
    <button class="sidebar-profile__menu-item">
      <Icon
        :name="selectedTheme?.icon ? (ICON_MAP[selectedTheme.icon] ?? 'lucide:sun') : 'lucide:sun'"
        size="14"
      />
      {{ t('userMenu.appearance') }}
      <Icon
        name="lucide:chevron-right"
        size="12"
        class="sidebar-profile__menu-check sidebar-profile__theme-chevron"
      />
    </button>

    <div v-if="show" class="sidebar-profile__theme-popup">
      <div class="sidebar-profile__theme-popup-inner">
        <button
          v-for="theme in themeSwither.items"
          :key="theme.id"
          class="sidebar-profile__menu-item"
          :class="{ 'sidebar-profile__menu-item--active': colorMode.preference === theme.id }"
          @click="setTheme(theme.id!)"
        >
          <Icon
            :name="theme.icon ? (ICON_MAP[theme.icon] ?? 'lucide:circle') : 'lucide:circle'"
            size="14"
          />
          {{ t(theme.title) }}
          <Icon
            v-if="colorMode.preference === theme.id"
            name="lucide:check"
            size="12"
            class="sidebar-profile__menu-check"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.sidebar-profile {
  &__theme-chevron {
    color: var(--text-tertiary-color);
  }

  &__theme-trigger {
    position: relative;

    &:hover .sidebar-profile__menu-item {
      background: var(--control-primary-minor-color);
      color: var(--text-primary-color);
    }
  }

  &__theme-popup {
    position: absolute;
    bottom: 0;
    left: 100%;
    padding-left: 4px;
    min-width: 160px;
    z-index: 11;

    &::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
    }

    &-inner {
      background: var(--background-secondary);
      border: 1px solid var(--divider-color);
      border-radius: var(--radius-lg);
      padding: var(--space-1);
      box-shadow: var(--shadow-popup);
    }
  }
}
</style>
