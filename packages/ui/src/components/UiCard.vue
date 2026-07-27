<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="ui-card">
    <div v-if="title" class="ui-card__header">
      <span class="ui-card__title">{{ title }}</span>
    </div>
    <div class="ui-card__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ui-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: #020420;
  overflow: hidden;
}

.ui-card__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.ui-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.ui-card__body {
  padding: 16px;
}
</style>
