<script setup lang="ts">
import { userMenu } from '~/components/App/UserMenu/config/user-menu'
import ThemeSwitcher from './ThemeSwitcher.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

withDefaults(defineProps<{ placement?: 'up' | 'down' }>(), {
  placement: 'up',
})

defineEmits<{ close: [] }>()

const { t } = useI18n()

function handleLogout() {
  console.log('Logout: not implemented in main — see auth-session branch or add your own')
}
</script>

<template>
  <div class="user-menu__dropdown" :class="`user-menu__dropdown--${placement}`">
    <template v-for="item in userMenu" :key="item.id">
      <div v-if="'divider' in item" class="user-menu__divider" />
      <LanguageSwitcher v-else-if="'slot' in item && item.id === 'language'" />
      <ThemeSwitcher v-else-if="'slot' in item && item.id === 'appearance'" />
      <NuxtLink
        v-else-if="'title' in item"
        class="user-menu__item"
        :to="item.url!"
        @click="$emit('close')"
      >
        <Icon :name="item.icon ?? 'lucide:circle'" size="14" />
        {{ t(item.title) }}
      </NuxtLink>
    </template>

    <div class="user-menu__divider" />

    <button
      class="user-menu__item user-menu__item--danger"
      @click="handleLogout"
    >
      <Icon name="lucide:log-out" size="14" />
      {{ t('userMenu.logout') }}
    </button>
  </div>
</template>

<style lang="scss">
.user-menu {
  &__dropdown {
    position: absolute;
    left: var(--space-2);
    right: var(--space-2);
    width: 12.5rem;
    background: var(--surface-popover);
    border: 1px solid var(--border-popover);
    border-radius: var(--radius-lg);
    padding: var(--space-1);
    box-shadow: var(--shadow-md);
    z-index: var(--z-dropdown);

    &--up {
      bottom: calc(100% + 4px);
      margin-bottom: calc(-1 * var(--space-0-5));
    }

    &--down {
      top: calc(100% + 4px);
      left: auto;
      right: 0;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) 10px;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    text-decoration: none;
    transition:
      background 0.1s,
      color 0.1s;
    text-align: left;
    white-space: nowrap;

    &:hover {
      background: var(--control-hover);
      color: var(--text-primary);
    }

    &--active {
      color: var(--text-primary);
    }

    &--danger:hover {
      background: var(--status-danger-subtle);
      color: var(--status-danger);
    }
  }

  &__divider {
    height: 1px;
    background: var(--border-popover);
    margin: 4px 0;
  }

  &__item-icon {
    margin-left: auto;
    color: var(--accent);
    flex-shrink: 0;
  }
}
</style>
