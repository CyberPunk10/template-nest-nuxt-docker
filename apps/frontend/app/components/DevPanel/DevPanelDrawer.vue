<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const devOpen = ref(false)
const panelRef = useTemplateRef('panel')
const tabRef = useTemplateRef('tab')

// таб в ignore: клик по нему сам переключает панель, иначе закрытие и открытие
// сработали бы на одном клике
onClickOutside(panelRef, () => {
  devOpen.value = false
}, { ignore: [tabRef] })
</script>

<template>
  <button
    ref="tab"
    class="dev-tab"
    :class="{ 'dev-tab--open': devOpen }"
    @click="devOpen = !devOpen"
  >
    <Icon name="lucide:terminal" size="11" />
    <span>DEV</span>
    <Icon :name="devOpen ? 'lucide:chevron-right' : 'lucide:chevron-left'" size="11" />
  </button>
  <aside
    ref="panel"
    class="dev-panel"
    :class="{ 'dev-panel--open': devOpen }"
  >
    <DevPanel />
  </aside>
</template>

<style lang="scss">
.dev-tab {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition:
    right 0.3s ease,
    color 0.15s,
    border-color 0.15s;
  writing-mode: vertical-rl;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 7px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-right: none;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-family: system-ui, sans-serif;
  z-index: 10000;

  &--open {
    right: 381px;
  }
  &:hover {
    color: var(--accent);
    border-color: rgba(0, 220, 130, 0.3);
  }
}

.dev-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 381px;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 9999;
  background: var(--surface-panel);
  border-left: 1px solid var(--border-subtle);
  overflow-y: auto;
  font-family: system-ui, sans-serif;

  &--open {
    transform: translateX(0);
  }
}
</style>
