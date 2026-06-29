<script setup lang="ts">
defineProps<{
  avatar: string
  name?: string
  email?: string
  open: boolean
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button class="sidebar-user__trigger" @click="$emit('click')">
    <div class="sidebar-user__avatar">{{ avatar }}</div>
    <div class="sidebar-user__info">
      <span class="sidebar-user__name">{{ name }}</span>
      <span class="sidebar-user__email">{{ email }}</span>
    </div>
    <Icon
      name="lucide:chevron-up"
      size="14"
      class="sidebar-user__chevron"
      :class="{ 'sidebar-user__chevron--open': open }"
    />
  </button>
</template>

<style lang="scss">
.sidebar-user {
  &__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    padding: 5px 10px 5px 4px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;

    &:hover {
      border-color: var(--divider-color);
      background: var(--control-primary-minor-color);
    }
  }

  &__avatar {
    flex: 0 0 1.75rem;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--background);
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__info {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
    text-align: left;
    opacity: 1;
    transition: opacity var(--app-sidebar-transition);
  }

  &__name {
    font-size: 13px;
    color: var(--text-primary-color);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__email {
    font-size: 11px;
    color: var(--text-secondary-color);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--text-tertiary-color);
    opacity: 1;
    transition:
      transform 0.2s,
      opacity var(--app-sidebar-transition);

    &--open {
      transform: rotate(180deg);
    }
  }

  &.--collapsed {
    .sidebar-user__info,
    .sidebar-user__chevron {
      opacity: 0;
    }
  }
}
</style>
