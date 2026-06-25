<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
const {
  public: { appVersion },
} = useRuntimeConfig()
</script>

<template>
  <NuxtLink class="logo" to="/">
    <Icon class="logo__icon" name="lucide:layers" size="24" />
    <span class="logo__text" :class="{ 'logo__text--hidden': collapsed }">
      <span class="logo__title">
        Monorepo <span class="logo__accent">Template</span>
        <span class="logo__version">v{{ appVersion }}</span>
      </span>
      <span class="logo__sub"> NestJS + Nuxt 4 </span>
    </span>
  </NuxtLink>
</template>

<style scoped lang="scss">
.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  align-self: center;

  &__icon {
    color: var(--color-accent);
    flex-shrink: 0;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    opacity: 1;
    transition:
      max-width var(--app-sidebar-transition),
      opacity var(--app-sidebar-transition);

    &--hidden {
      max-width: 0;
      opacity: 0;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary-color);
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  &__accent {
    color: var(--color-accent);
  }

  &__version {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-tertiary-color);
  }

  &__sub {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary-color);
    letter-spacing: 0.05em;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
