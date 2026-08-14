<script setup lang="ts">
definePageMeta({ title: 'nav.tasks' })
</script>

<template>
  <div class="tasks-page">
    <div class="tasks-page__content">
      <HomeTasks />
    </div>
  </div>
</template>

<style lang="scss">
.tasks-page {
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
