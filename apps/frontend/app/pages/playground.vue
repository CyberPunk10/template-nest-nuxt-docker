<script setup lang="ts">
definePageMeta({ title: 'nav.playground' })
</script>

<template>
  <div class="playground-page">
    <div class="playground-page__content">
      <HomeTasks />
      <HomeDbTables class="home-db-tables" />
    </div>
  </div>
</template>

<style lang="scss">
.playground-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px 20px;

  &__content {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .home-db-tables {
    margin-top: 16px;
  }
}
</style>
