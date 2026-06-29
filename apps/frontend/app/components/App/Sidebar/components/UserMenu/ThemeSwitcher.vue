<script setup lang="ts">
import { resolveIcon, themeSwither } from '../../config/sidebar-menu'

const colorMode = useColorMode()
const { t } = useI18n()

const show = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function open() {
  if (closeTimer) clearTimeout(closeTimer)
  show.value = true
}

function close() {
  closeTimer = setTimeout(() => {
    show.value = false
  }, 150)
}

const selectedTheme = computed(() => themeSwither.items?.find(i => i.id === colorMode.preference))

function setTheme(id: string) {
  if (colorMode.preference === id) return
  colorMode.preference = id
}
</script>

<template>
  <div
    class="sidebar-user__theme"
    @mouseenter="open"
    @mouseleave="close"
  >
    <button class="sidebar-user__item">
      <Icon
        :name="selectedTheme?.icon ? resolveIcon(selectedTheme.icon) : 'lucide:sun'"
        size="14"
      />
      {{ t('userMenu.appearance') }}
      <Icon
        name="lucide:chevron-right"
        size="12"
        class="sidebar-user__item-icon sidebar-user__item-chevron"
      />
    </button>

    <div v-if="show" class="sidebar-user__theme-dropdown">
      <div class="sidebar-user__theme-dropdown-inner">
        <button
          v-for="theme in themeSwither.items"
          :key="theme.id"
          class="sidebar-user__item"
          :class="{ 'sidebar-user__item--active': colorMode.preference === theme.id }"
          @click="setTheme(theme.id!)"
        >
          <Icon
            :name="theme.icon ? resolveIcon(theme.icon) : 'lucide:circle'"
            size="14"
          />
          {{ t(theme.title) }}
          <Icon
            v-if="colorMode.preference === theme.id"
            name="lucide:check"
            size="12"
            class="sidebar-user__item-icon"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.sidebar-user {
  &__item-chevron {
    color: var(--text-tertiary-color);
  }

  &__theme {
    position: relative;

    &:hover > .sidebar-user__item {
      background: var(--control-primary-minor-color);
      color: var(--text-primary-color);
    }
  }

  &__item {
    &:not(:last-child) {
      margin-bottom: var(--space-0-5);
    }
  }

  &__theme-dropdown {
    position: absolute;
    bottom: 0;
    left: calc(100% + var(--space-1-5));
    padding-left: 4px;
    z-index: 11;

    &::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
    }

    &-inner {
      width: 10.625rem;
      background: var(--background-secondary);
      border: 1px solid var(--divider-color);
      border-radius: var(--radius-lg);
      padding: var(--space-1);
      box-shadow: var(--shadow-popup);
    }
  }
}
</style>
