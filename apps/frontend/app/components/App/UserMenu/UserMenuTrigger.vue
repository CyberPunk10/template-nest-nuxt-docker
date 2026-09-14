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
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: .625rem;
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    padding: 3px 10px 3px 4px;
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
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--accent);
    border: 1px solid var(--surface-panel);
    color: var(--surface-app);
    font-size: var(--text-sm);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    text-align: left;
    opacity: 1;
    transition: opacity var(--app-sidebar-transition);
  }

  &__name {
    font-size: var(--text-sm);
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
