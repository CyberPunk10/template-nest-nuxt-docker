<script setup lang="ts">
import { resolveIcon } from '~/components/App/Sidebar/config/icons'
import { themes } from '~/components/App/UserMenu/config/user-menu'

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
    class="user-menu__theme"
    @mouseenter="open"
    @mouseleave="close"
  >
    <button class="user-menu__item">
      <Icon :name="activeThemeIcon" size="14" />
      {{ t('userMenu.appearance') }}
      <Icon
        name="lucide:chevron-right"
        size="12"
        class="user-menu__item-icon user-menu__item-chevron"
      />
    </button>

    <div v-if="show" class="user-menu__theme-dropdown">
      <div class="user-menu__theme-dropdown-inner">
        <button
          class="user-menu__item user-menu__item--follow-system"
          :class="{ 'user-menu__item--active': followSystem }"
          @click="setFollowSystem(!followSystem)"
        >
          <Icon name="lucide:monitor" size="14" />
          {{ t('themes.followSystem') }}
          <span class="user-menu__switch" :class="{ 'user-menu__switch--on': followSystem }">
            <span class="user-menu__switch-thumb" />
          </span>
        </button>

        <div class="user-menu__divider user-menu__divider--inner" />

        <template v-for="(theme, index) in themes" :key="theme.id">
          <div
            v-if="index > 0 && themes[index - 1]?.kind !== theme.kind"
            class="user-menu__divider user-menu__divider--inner"
          />
          <button
            class="user-menu__item"
            :class="{ 'user-menu__item--active': isChecked(theme.id, theme.kind) }"
            @click="selectTheme(theme.id, theme.kind)"
          >
            <Icon :name="resolveIcon(theme.icon)" size="14" />
            {{ t(theme.title) }}
            <Icon
              v-if="isChecked(theme.id, theme.kind)"
              name="lucide:check"
              size="12"
              class="user-menu__item-icon"
            />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.user-menu {
  &__item-chevron {
    color: var(--text-muted);
  }

  &__theme {
    position: relative;

    &:hover > .user-menu__item {
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

      .user-menu__switch--on & {
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

      .user-menu__divider--inner {
        background: var(--border-popover);
      }
    }
  }
}
</style>
