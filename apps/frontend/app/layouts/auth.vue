<template>
  <div class="layout-auth">
    <NuxtRouteAnnouncer />
    <slot />
  </div>
</template>

<style scoped lang="scss">
.layout-auth {
  min-height: 100vh;
  background: #080f1a;
  font-family: system-ui, sans-serif;
}
</style>

<style lang="scss">
.auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  &__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 320px;
  }

  &__title {
    color: #e2e8f0;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
  }

  &__input {
    background: var(--divider-color);
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: var(--color-accent);
    }
  }

  &__error {
    font-size: 13px;
    color: #ef4444;
    margin: 0;
  }

  &__btn {
    background: var(--color-accent);
    color: var(--background-secondary);
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__link {
    font-size: 13px;
    color: var(--text-tertiary-color);
    text-align: center;
    text-decoration: none;

    &:hover {
      color: #94a3b8;
    }
  }
}
</style>
