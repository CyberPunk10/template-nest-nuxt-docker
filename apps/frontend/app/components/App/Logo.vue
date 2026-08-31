<template>
  <NuxtLink class="logo" to="/">
    <Icon
      class="logo__icon"
      name="lucide:layers"
      size="24"
    />
    <span class="logo__text">
      <span class="logo__title">
        Monorepo <span class="logo__accent">Template</span>
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
    color: var(--accent);
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
    // схлопывание задаёт свёрнутый сайдбар (миксин sidebar-collapsed в AppSidebar.vue),
    // здесь только развёрнутое состояние и переход между ними
    transition:
      max-width var(--app-sidebar-transition),
      opacity var(--app-sidebar-transition);
  }

  &__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  &__accent {
    color: var(--accent);
  }

  &__sub {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
