<script setup lang="ts">
defineProps<{
  stats: { label: string; value: string }[]
}>()
</script>

<template>
  <div class="stats">
    <div v-for="s in stats" :key="s.label" class="stat">
      <span class="stat__value">{{ s.value }}</span>
      <span class="stat__label">{{ s.label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
$bg-card: #0b1525;
$border: #1e293b;
$text-primary: #f1f5f9;
$text-faint: #475569;

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: $border;
  border: 1px solid $border;
  border-radius: 10px;
  overflow: hidden;
}

.stat {
  background: $bg-card;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1;
  }

  &__label {
    font-size: 11px;
    color: $text-faint;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
}
</style>
