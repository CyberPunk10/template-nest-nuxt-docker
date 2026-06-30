<script setup lang="ts">
import { resolveIcon, themes } from '../../config/sidebar-menu'

const { followSystem, selectedLight, selectedDark, activeTheme, setFollowSystem, selectTheme } = useThemePreference()
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

const activeThemeIcon = computed(() => {
  const theme = themes.find(t => t.id === activeTheme.value)
  return theme ? resolveIcon(theme.icon) : 'lucide:sun'
})

function isChecked(id: string, kind: 'light' | 'dark') {
  if (followSystem.value) {
    return kind === 'light' ? selectedLight.value === id : selectedDark.value === id
  }
  return activeTheme.value === id
}
</script>

<template>
  <div
    class="sidebar-user__theme"
    @mouseenter="open"
    @mouseleave="close"
  >
    <button class="sidebar-user__item">
      <Icon :name="activeThemeIcon" size="14" />
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
          class="sidebar-user__item sidebar-user__item--follow-system"
          :class="{ 'sidebar-user__item--active': followSystem }"
          @click="setFollowSystem(!followSystem)"
        >
          <Icon name="lucide:monitor" size="14" />
          {{ t('themes.followSystem') }}
          <span class="sidebar-user__switch" :class="{ 'sidebar-user__switch--on': followSystem }">
            <span class="sidebar-user__switch-thumb" />
          </span>
        </button>

        <div class="sidebar-user__divider sidebar-user__divider--inner" />

        <template v-for="(theme, index) in themes" :key="theme.id">
          <div
            v-if="index > 0 && themes[index - 1]?.kind !== theme.kind"
            class="sidebar-user__divider sidebar-user__divider--inner"
          />
          <button
            class="sidebar-user__item"
            :class="{ 'sidebar-user__item--active': isChecked(theme.id, theme.kind) }"
            @click="selectTheme(theme.id, theme.kind)"
          >
            <Icon :name="resolveIcon(theme.icon)" size="14" />
            {{ t(theme.title) }}
            <Icon
              v-if="isChecked(theme.id, theme.kind)"
              name="lucide:check"
              size="12"
              class="sidebar-user__item-icon"
            />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.sidebar-user {
  &__item-chevron {
    color: var(--text-muted);
  }

  &__theme {
    position: relative;

    &:hover > .sidebar-user__item {
      background: var(--control-hover);
      color: var(--text-primary);
    }
  }

  &__item {
    &:not(:last-child) {
      margin-bottom: var(--space-0-5);
    }

    &--follow-system {
      justify-content: flex-start;
    }
  }

  &__divider--inner {
    margin: var(--space-1) 0;
  }

  &__switch {
    margin-left: auto;
    flex-shrink: 0;
    width: 28px;
    height: 16px;
    border-radius: 8px;
    background: var(--text-muted);
    position: relative;
    transition: background 0.15s;

    &--on {
      background: var(--accent);
    }

    &-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;

      .sidebar-user__switch--on & {
        transform: translateX(12px);
      }
    }
  }

  &__theme-dropdown {
    position: absolute;
    bottom: 0;
    left: calc(100% + var(--space-1-5));
    padding-left: 4px;
    z-index: var(--z-raised);

    &::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
    }

    &-inner {
      width: 10.625rem;
      background: var(--surface-popover);
      border: 1px solid var(--border-popover);
      border-radius: var(--radius-lg);
      padding: var(--space-1);
      box-shadow: var(--shadow-md);

      .sidebar-user__divider--inner {
        background: var(--border-popover);
      }
    }
  }
}
</style>
