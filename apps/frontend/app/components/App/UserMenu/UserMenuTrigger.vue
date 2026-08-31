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
  <button class="user-menu__trigger" @click="$emit('click')">
    <div class="user-menu__avatar">{{ avatar }}</div>
    <div class="user-menu__info">
      <span class="user-menu__name">{{ name }}</span>
      <span class="user-menu__email">{{ email }}</span>
    </div>
    <Icon
      name="lucide:chevron-up"
      size="14"
      class="user-menu__chevron"
      :class="{ 'user-menu__chevron--open': open }"
    />
  </button>
</template>

<style lang="scss">
.user-menu {
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
      border-color: var(--border-subtle);
      background: var(--control-hover);
    }
  }

  &__avatar {
    flex: 0 0 1.75rem;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--accent);
    color: var(--surface-app);
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
    color: var(--text-primary);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__email {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--text-muted);
    opacity: 1;
    transition:
      transform 0.2s,
      opacity var(--app-sidebar-transition);

    &--open {
      transform: rotate(180deg);
    }
  }

}
</style>
