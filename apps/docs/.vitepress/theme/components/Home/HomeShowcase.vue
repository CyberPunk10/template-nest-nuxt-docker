<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { stackLogos } from './home-data'
import TechLogo from './TechLogo.vue'

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress),
// без vue-i18n. theme меняется при смене языка — компонент перерисовывается.
const { theme } = useData()
const home = computed(() => theme.value.home!)
</script>

<template>
  <section class="section">
    <h2 class="section__title">{{ home.showcase.title }}</h2>
    <p class="showcase__lead">{{ home.showcase.lead }}</p>
    <div class="showcase">
      <div
        v-for="logo in stackLogos"
        :key="logo.id"
        class="showcase__item"
        :style="{ '--logo-color': logo.color }"
      >
        <div class="showcase__logo">
          <TechLogo :name="logo.id" :size="38" />
        </div>
        <p class="showcase__name">{{ home.showcase.items[logo.id].name }}</p>
        <p class="showcase__role">{{ home.showcase.items[logo.id].role }}</p>
        <code v-if="logo.branch" class="showcase__branch">{{ logo.branch }}</code>
      </div>
    </div>
  </section>
</template>

<style scoped>
.showcase__lead {
  font-size: var(--home-text-md);
  line-height: var(--home-leading-relaxed);
  color: var(--home-text-muted);
  margin: -8px 0 20px;
  max-width: 68ch;
}

.showcase {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.showcase__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 20px 12px 18px;
  border: 1px solid var(--home-border-subtle);
  border-radius: 10px;
  background: var(--home-surface-2);
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.2s;
}
.showcase__item:hover {
  /* color-mix даёт подложку и рамку в фирменном цвете технологии,
     не заводя по паре захардкоженных rgba на каждый логотип. */
  border-color: color-mix(in srgb, var(--logo-color) 45%, transparent);
  background: color-mix(in srgb, var(--logo-color) 7%, transparent);
  transform: translateY(-2px);
}

/* Логотип приглушён, пока карточка не в фокусе: восемь брендовых цветов
   одновременно спорят друг с другом и с акцентом витрины. */
.showcase__logo {
  color: var(--home-text-dim);
  transition: color 0.2s;
  margin-bottom: 6px;
}
.showcase__item:hover .showcase__logo {
  color: var(--logo-color);
}

.showcase__name {
  font-size: var(--home-text-lg);
  font-weight: 700;
  letter-spacing: var(--home-tracking-tight);
  color: var(--home-text-primary);
  margin: 0;
}
.showcase__role {
  font-size: var(--home-text-sm);
  line-height: var(--home-leading-normal);
  color: var(--home-text-soft);
  margin: 0;
}
.showcase__branch {
  font-family: monospace;
  font-size: var(--home-text-xs);
  color: var(--home-text-dim);
  border: 1px solid var(--home-border-2);
  border-radius: 4px;
  padding: 1px 5px;
  margin-top: 4px;
}

@media (max-width: 900px) {
  .showcase {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .showcase {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .showcase__item {
    padding: 16px 8px 14px;
  }
}

/* Подъём карточки при наведении — декоративный. */
@media (prefers-reduced-motion: reduce) {
  .showcase__item {
    transition: border-color 0.2s, background 0.2s;
  }
  .showcase__item:hover {
    transform: none;
  }
}
</style>
