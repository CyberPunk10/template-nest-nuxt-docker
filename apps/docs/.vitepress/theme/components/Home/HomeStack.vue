<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { branches, layers, type Layer } from './home-data'

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress),
// без vue-i18n. theme меняется при смене языка — компонент перерисовывается.
const { theme } = useData()
const home = computed(() => theme.value.home!)

function getChips(branchIndex: number, layer: Layer) {
  const current = branches[branchIndex]?.stack[layer] ?? []
  const prev = branchIndex > 0 ? (branches[branchIndex - 1]?.stack[layer] ?? []) : []
  return current.filter(item => !prev.includes(item))
}
</script>

<template>
  <section class="section">
    <h2 class="section__title">{{ home.stack.title }}</h2>
    <div class="variants-wrap">
      <div class="variants">
        <div class="variants__head">
          <div class="variants__layer-col" />
          <div
            v-for="(b, bi) in branches"
            :key="b.name"
            class="variants__branch-col variants__branch-col--head"
          >
            <div
              class="variants__branch-name"
              :class="{ 'variants__branch-name--current': b.current }"
            >
              <Icon name="lucide:git-branch" size="11" />
              <code>{{ b.name }}</code>
              <span v-if="b.current" class="branch-badge">{{ home.branches.current }}</span>
            </div>
            <div v-if="bi > 0" class="variants__branch-base">
              {{ home.branches.basedOn }} <code>{{ branches[bi - 1]?.name }}</code> +
            </div>
          </div>
        </div>
        <div
          v-for="layer in layers"
          :key="layer"
          class="variants__row"
        >
          <div class="variants__layer-col">
            <span class="variants__layer">{{ layer }}</span>
          </div>
          <div
            v-for="(b, bi) in branches"
            :key="b.name"
            class="variants__branch-col"
          >
            <div class="variants__cell">
              <template v-if="getChips(bi, layer).length">
                <span
                  v-for="item in getChips(bi, layer)"
                  :key="item"
                  class="stack__chip"
                >
                  {{ item }}
                </span>
              </template>
              <span v-else class="variants__cell-empty">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.branch-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(0, 220, 130, 0.12);
  color: var(--home-accent);
  border-radius: 4px;
  padding: 2px 5px;
}

.variants-wrap {
  overflow-x: auto;
}

.variants {
  border: 1px solid var(--home-border-subtle);
  border-radius: 12px;
  overflow: hidden;
  min-width: 600px;
}

.variants__head {
  display: grid;
  grid-template-columns: 90px repeat(3, 1fr);
  border-bottom: 2px solid var(--home-border-subtle);
}

.variants__row {
  display: grid;
  grid-template-columns: 90px repeat(3, 1fr);
  border-bottom: 1px solid var(--home-border-2);
}
.variants__row:last-child {
  border-bottom: none;
}

.variants__layer-col {
  padding: 16px 14px;
  background: var(--home-surface-deep);
  border-right: 1px solid var(--home-border-subtle);
  display: flex;
  align-items: flex-start;
}

.variants__layer {
  font-size: 11px;
  font-weight: 600;
  color: var(--home-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-top: 2px;
}

.variants__branch-col {
  border-right: 1px solid var(--home-border-2);
  background: var(--home-surface-2);
}
.variants__branch-col:last-child {
  border-right: none;
}
.variants__branch-col--head {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
}

.variants__branch-name {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--home-text-muted);
}
.variants__branch-name code {
  font-family: monospace;
  color: var(--home-text-muted);
}
.variants__branch-name--current code {
  color: var(--home-accent);
}

.variants__branch-base {
  font-size: 11px;
  color: var(--home-text-dim);
  font-style: italic;
}
.variants__branch-base code {
  font-family: monospace;
  color: var(--home-text-dim);
  font-style: normal;
}

.variants__cell {
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-content: flex-start;
}

.variants__cell-empty {
  font-size: 12px;
  color: var(--home-border-subtle);
}

.stack__chip {
  font-size: 11px;
  padding: 0 var(--home-space-2);
  border-radius: 5px;
  white-space: nowrap;
  background: rgba(0, 220, 130, 0.07);
  border: 1px solid rgba(0, 220, 130, 0.25);
  color: var(--home-accent);
}
</style>
