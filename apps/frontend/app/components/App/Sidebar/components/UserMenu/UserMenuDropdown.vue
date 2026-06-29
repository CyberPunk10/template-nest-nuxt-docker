<script setup lang="ts">
import { userMenu } from '../../config/sidebar-menu'
import ThemeSwitcher from './ThemeSwitcher.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()

const { logout } = useAuth()

async function handleLogout() {
  try {
    await logout()
  } catch (e) {
    console.log('logout error', e)
  }
}
</script>

<template>
  <div class="sidebar-user__dropdown">
    <template v-for="item in userMenu" :key="'divider' in item ? item : item.title">
      <div v-if="'divider' in item" class="sidebar-user__divider" />
      <NuxtLink
        v-else
        class="sidebar-user__item"
        :to="item.url!"
        @click="$emit('close')"
      >
        <Icon :name="item.icon ?? 'lucide:circle'" size="14" />
        {{ t(item.title) }}
      </NuxtLink>
    </template>

    <div class="sidebar-user__divider" />

    <ThemeSwitcher />

    <div class="sidebar-user__divider" />

    <button
      class="sidebar-user__item sidebar-user__item--danger"
      @click="handleLogout"
    >
      <Icon name="lucide:log-out" size="14" />
      {{ t('userMenu.logout') }}
    </button>
  </div>
</template>

<style lang="scss">
.sidebar-user {
  &__dropdown {
    position: absolute;
    bottom: calc(100% + 4px);
    left: var(--space-2);
    right: var(--space-2);
    width: 12.5rem;
    background: var(--background-secondary);
    border: 1px solid var(--divider-color);
    border-radius: var(--radius-lg);
    padding: var(--space-1);
    margin-bottom: calc(-1 * var(--space-0-5));
    box-shadow: var(--shadow-popup);
    z-index: 100;
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
    color: var(--text-secondary-color);
    cursor: pointer;
    text-decoration: none;
    transition:
      background 0.1s,
      color 0.1s;
    text-align: left;
    white-space: nowrap;

    &:hover {
      background: var(--control-primary-minor-color);
      color: var(--text-primary-color);
    }

    &--active {
      color: var(--text-primary-color);
    }

    &--danger:hover {
      background: var(--danger-bg-color);
      color: var(--danger-color);
    }
  }

  &__divider {
    height: 1px;
    background: var(--divider-color);
    margin: 4px 0;
  }

  &__item-icon {
    margin-left: auto;
    color: var(--color-accent);
    flex-shrink: 0;
  }
}
</style>
