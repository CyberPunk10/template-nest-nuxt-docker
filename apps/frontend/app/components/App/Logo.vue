<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
const {
  public: { branch, appVersion },
} = useRuntimeConfig()
</script>

<template>
  <NuxtLink class="logo" to="/">
    <Icon class="logo__icon" name="lucide:layers" size="24" />
    <span v-if="!collapsed" class="logo__text">
      <span class="logo__title">
        Monorepo <span class="logo__accent">Template</span>
        <span class="logo__version">v{{ appVersion }}</span>
      </span>
      <span class="logo__sub">
        NestJS + Nuxt 4
        <span class="logo__branch">
          <Icon name="lucide:git-branch" size="10" /><span class="logo__branch-name">{{
            branch
          }}</span>
        </span>
      </span>
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
    color: #00dc82;
    flex-shrink: 0;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 14px;
    font-weight: 800;
    color: #e2e8f0;
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  &__accent {
    color: #00dc82;
  }

  &__version {
    font-size: 11px;
    font-weight: 400;
    color: #64748b;
  }

  &__sub {
    font-size: 11px;
    font-weight: 500;
    color: #475569;
    letter-spacing: 0.05em;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__branch {
    font-size: 10px;
    font-weight: 600;
    font-family: monospace;
    color: #00dc82;
    background: rgba(0, 220, 130, 0.1);
    border: 1px solid rgba(0, 220, 130, 0.2);
    border-radius: 4px;
    padding: 2px 5px;
    display: flex;
  }

  &__branch-name {
    padding-left: 2px;
  }
}
</style>
