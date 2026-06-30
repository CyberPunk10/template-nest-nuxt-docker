<template>
  <div class="home">
    <div class="col">
      <NuxtWelcome class="nuxt-welcome-component" />
    </div>
    <div class="col col--home-data">
      <HomeTasks />
      <HomeDbTables class="home-db-tables" />
    </div>
  </div>
</template>

<style lang="scss">
@use '~/assets/css/nuxt-welcome';

.home {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0;
  flex: 1;
  min-height: 0;
  background: var(--surface-card);
  color: #fff;

  .nuxt-welcome-component {
    min-height: auto !important;
    height: 100%;
    background-color: var(--surface-app) !important;
  }

  .col {
    border-right: 1px solid var(--border-subtle);
    overflow: auto;
  }

  .col--home-data {
    border-right: none;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .home-db-tables {
    margin-top: 16px;
  }
}
</style>
