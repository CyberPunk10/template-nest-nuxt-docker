<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress),
// без vue-i18n. theme меняется при смене языка — компонент перерисовывается.
const { theme, lang } = useData()

const hero = computed(() => theme.value.home!.hero)

// Ссылка на документацию с учётом текущей локали: ru — в корне (без префикса),
// en/th — в своих папках. withBase добавит base '/docs/'.
const docsLink = computed(() => {
  const prefix = lang.value === 'ru' ? '' : `/${lang.value}`
  return withBase(`${prefix}/guide/getting-started`)
})
</script>

<template>
  <div class="hero">
    <div class="hero__glow" />
    <div class="hero__content">
      <div class="hero__inner">
        <span class="hero__badge">{{ hero.badge }}</span>
        <h1 class="hero__title">
          {{ hero.title }}<br><span class="hero__title-accent">{{ hero.titleAccent }}</span>
        </h1>
        <p class="hero__subtitle" v-html="hero.subtitle.replace('\n', '<br />')" />
        <div class="hero__actions">
          <a
            class="hero__btn hero__btn--primary"
            :href="docsLink"
          >
            <Icon name="lucide:book-open" size="15" />
            {{ hero.docs }}
          </a>
          <a
            class="hero__btn hero__btn--ghost"
            href="/"
            target="_self"
          >
            <Icon name="lucide:log-in" size="15" />
            {{ hero.toDashboard }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.hero {
  position: relative;
  overflow: hidden;
  padding: 80px 48px var(--vp-nav-height);
}
.hero__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 50% 100% at 50% 0%,
    rgba(0, 220, 130, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.hero__content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}
.hero__inner {
  max-width: 600px;
}
.hero__badge {
  display: inline-flex;
  background: rgba(0, 220, 130, 0.08);
  border: 1px solid rgba(0, 220, 130, 0.2);
  color: var(--home-accent);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.hero__title {
  font-size: 42px;
  font-weight: 800;
  color: var(--home-text-strong);
  margin: 0 0 16px;
  line-height: 1.15;
}
.hero__title-accent {
  color: var(--home-accent);
}
.hero__subtitle {
  font-size: 16px;
  color: var(--home-text-muted);
  margin: 0 0 32px;
  line-height: 1.7;
}
.hero__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: var(--home-radius-lg);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    opacity 0.15s,
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.hero__btn--primary {
  background: var(--home-accent);
  color: var(--home-surface-card);
}
.hero__btn--primary:hover {
  opacity: 0.88;
}
.hero__btn--ghost {
  background: transparent;
  border: 1px solid var(--home-border-subtle);
  color: var(--home-text-dim);
}
.hero__btn--ghost:hover {
  border-color: var(--home-text-dim);
  color: var(--home-text-hover);
}

@media (max-width: 900px) {
  .hero {
    padding: 48px 24px 48px;
  }
  .hero__title {
    font-size: 36px;
  }
  .hero__badge {
    font-size: 10px;
    padding: 2px 10px;
    margin-top: 16px;
    margin-bottom: 14px;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 48px 24px 40px;
  }
  .hero__title {
    font-size: 32px;
  }
  .hero__subtitle {
    font-size: 14px;
  }
  .hero__actions {
    flex-direction: column;
  }
  .hero__btn {
    justify-content: center;
  }
}
</style>
