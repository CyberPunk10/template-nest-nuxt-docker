<script setup lang="ts">
definePageMeta({ title: 'nav.dbTables' })
</script>

<template>
  <div class="db-tables-page">
    <div class="db-tables-page__content">
      <HomeDbTables />
    </div>
  </div>
</template>

<style lang="scss">
.db-tables-page {
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
}
</style>
