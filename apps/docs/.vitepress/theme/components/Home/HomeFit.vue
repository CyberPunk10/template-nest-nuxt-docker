<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { fitCases, type FitVerdict } from './home-data'

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress),
// без vue-i18n. theme меняется при смене языка — компонент перерисовывается.
const { theme } = useData()
const fit = computed(() => theme.value.home!.fit)

const verdictIcons: Record<FitVerdict, string> = {
  good: 'lucide:check-circle',
  bad: 'lucide:x-circle',
  mixed: 'lucide:alert-circle',
}
</script>

<template>
  <section class="section">
    <h2 class="section__title">{{ fit.title }}</h2>
    <p class="fit__lead">{{ fit.lead }}</p>

    <div class="fit__legend">
      <span
        v-for="v in (['good', 'mixed', 'bad'] as const)"
        :key="v"
        class="fit__legend-item"
        :class="`fit__legend-item--${v}`"
      >
        <Icon :name="verdictIcons[v]" size="13" />
        {{ fit.verdicts[v] }}
      </span>
    </div>

    <div class="fit">
      <div
        v-for="c in fitCases"
        :key="c.id"
        class="fit__card"
        :class="`fit__card--${c.verdict}`"
      >
        <div class="fit__head">
          <span class="fit__icon"><Icon :name="c.icon" size="16" /></span>
          <span class="fit__name">{{ fit.cases[c.id].name }}</span>
          <span class="fit__verdict"><Icon :name="verdictIcons[c.verdict]" size="15" /></span>
        </div>
        <p class="fit__why">{{ fit.cases[c.id].why }}</p>
        <p v-if="fit.cases[c.id].alt" class="fit__alt">
          <span class="fit__alt-label">{{ fit.altLabel }}</span>
          {{ fit.cases[c.id].alt }}
        </p>
      </div>
    </div>

    <p class="fit__note">{{ fit.note }}</p>
  </section>
</template>

<style scoped>
.fit__lead {
  font-size: 14px;
  line-height: 1.6;
  color: var(--home-text-muted);
  margin: -8px 0 14px;
  max-width: 72ch;
}

.fit__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 18px;
}
.fit__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--home-text-dim);
}
.fit__legend-item--good {
  color: var(--home-accent);
}
.fit__legend-item--mixed {
  color: #f59e0b;
}
.fit__legend-item--bad {
  color: #f87171;
}

.fit {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.fit__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--home-border-subtle);
  /* Цветная полоса слева кодирует вердикт — она читается быстрее иконки
     и не зависит от цвета для тех, кто его не различает (полоса + иконка). */
  border-left: 3px solid var(--home-border-subtle);
  border-radius: 10px;
  background: var(--home-surface-2);
  transition:
    border-color 0.2s,
    background 0.2s;
}
.fit__card--good {
  border-left-color: var(--home-accent);
}
.fit__card--mixed {
  border-left-color: #f59e0b;
}
.fit__card--bad {
  border-left-color: #f87171;
}
.fit__card--good:hover {
  background: rgba(0, 220, 130, 0.04);
}
.fit__card--mixed:hover {
  background: rgba(245, 158, 11, 0.05);
}
.fit__card--bad:hover {
  background: rgba(248, 113, 113, 0.05);
}

.fit__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.fit__icon {
  display: flex;
  color: var(--home-text-dim);
  flex-shrink: 0;
}
.fit__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--home-text-primary);
  line-height: 1.3;
  flex: 1;
}
.fit__verdict {
  display: flex;
  flex-shrink: 0;
}
.fit__card--good .fit__verdict {
  color: var(--home-accent);
}
.fit__card--mixed .fit__verdict {
  color: #f59e0b;
}
.fit__card--bad .fit__verdict {
  color: #f87171;
}

.fit__why {
  font-size: 12px;
  line-height: 1.55;
  /* text-soft, а не text-muted: muted (#52525b в тёмной теме) на подложке
     карточки даёт контраст ниже 4.5:1 — для основного текста мало. */
  color: var(--home-text-soft);
  margin: 0;
}

.fit__alt {
  font-size: 11px;
  line-height: 1.5;
  color: var(--home-text-muted);
  margin: 0;
  padding-top: 8px;
  border-top: 1px solid var(--home-border-2);
}
.fit__alt-label {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 5px;
}

.fit__note {
  font-size: 12px;
  line-height: 1.6;
  color: var(--home-text-dim);
  margin: 16px 0 0;
  font-style: italic;
  max-width: 78ch;
}

@media (max-width: 1000px) {
  .fit {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .fit {
    grid-template-columns: 1fr;
  }
}
</style>
