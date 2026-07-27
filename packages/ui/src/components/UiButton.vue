<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  isIcon?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="ui-button"
    :class="[`ui-button--${variant ?? 'primary'}`, { 'ui-button--icon': isIcon }]"
    :type="type ?? 'button'"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.2;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    opacity 0.15s,
    background 0.15s;
}

.ui-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ui-button--primary {
  background: var(--accent);
  color: var(--surface-card);
}

.ui-button--primary:hover:not(:disabled) {
  background: #00c974;
}

.ui-button--ghost {
  background: transparent;
  border-color: var(--border-subtle);
  color: var(--text-primary);
}

.ui-button--ghost:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.ui-button--danger {
  background: transparent;
  border-color: var(--border-subtle);
  color: var(--text-muted);
}

.ui-button--danger:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.ui-button--icon {
  padding: 6px;
  width: 30px;
  height: 30px;
}
</style>
