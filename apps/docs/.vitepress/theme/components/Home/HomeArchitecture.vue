<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress),
// без vue-i18n. theme меняется при смене языка — компонент перерисовывается.
const { theme } = useData()
const arch = computed(() => theme.value.home!.architecture)
</script>

<template>
  <section class="section">
    <h2 class="section__title">{{ arch.title }}</h2>
    <p class="arch__lead">{{ arch.lead }}</p>

    <!-- Схема собрана на разметке, а не одним статичным SVG: подписи внутри
         узлов переводятся вместе с остальной витриной и переносятся на узкий
         экран, чего вшитый в SVG текст не умеет. -->
    <div class="arch">
      <div class="arch__node arch__node--plain">
        <span class="arch__node-title">{{ arch.nodes.browser.title }}</span>
        <span class="arch__node-desc">{{ arch.nodes.browser.desc }}</span>
      </div>

      <div class="arch__link">
        <span class="arch__link-label">{{ arch.links.ssr }}</span>
      </div>

      <div class="arch__row">
        <div class="arch__node arch__node--frontend">
          <span class="arch__node-tag">frontend</span>
          <span class="arch__node-title">Nuxt 4</span>
          <span class="arch__node-desc">{{ arch.nodes.nuxt.desc }}</span>
          <code class="arch__node-port">:3200</code>
        </div>

        <div class="arch__link arch__link--h">
          <span class="arch__link-label">{{ arch.links.api }}</span>
        </div>

        <div class="arch__node arch__node--backend">
          <span class="arch__node-tag">backend</span>
          <span class="arch__node-title">NestJS</span>
          <span class="arch__node-desc">{{ arch.nodes.nest.desc }}</span>
          <code class="arch__node-port">:3100</code>
        </div>
      </div>

      <!-- Ветка к БД идёт от NestJS, а не из центра ряда: с PostgreSQL
           работает только бэкенд. Смещаем колонку вправо, под узел Nest. -->
      <div class="arch__db-branch">
        <div class="arch__link">
          <span class="arch__link-label">{{ arch.links.prisma }}</span>
        </div>
        <div class="arch__node arch__node--db">
          <span class="arch__node-tag">postgres-prisma</span>
          <span class="arch__node-title">PostgreSQL 17</span>
          <span class="arch__node-desc">{{ arch.nodes.db.desc }}</span>
        </div>
      </div>

      <!-- @repo/shared стоит отдельной плашкой без соединителя: линия отсюда
           шла бы от нижнего узла схемы (PostgreSQL) и читалась бы как связь
           с БД, которой нет. Кто импортирует пакет — сказано подписью внутри. -->
      <div class="arch__node arch__node--shared">
        <span class="arch__node-tag">packages</span>
        <span class="arch__node-title">@repo/shared</span>
        <span class="arch__node-desc">{{ arch.nodes.shared.desc }}</span>
        <span class="arch__shared-users">Nuxt 4 · NestJS</span>
      </div>

      <div class="arch__wrapper-label">
        <Icon name="lucide:layers" size="12" />
        {{ arch.wrapper }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.arch__lead {
  font-size: 14px;
  line-height: 1.6;
  color: var(--home-text-muted);
  margin: -8px 0 20px;
  max-width: 68ch;
}

.arch {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  border: 1px dashed var(--home-border-subtle);
  border-radius: 12px;
  padding: 24px 20px 34px;
  background: var(--home-surface-deep);
}

.arch__node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 190px;
  padding: 12px 18px;
  border: 1px solid var(--home-border-subtle);
  border-radius: 10px;
  background: var(--home-surface-card);
  text-align: center;
}
.arch__node--plain {
  border-style: dashed;
  background: transparent;
}
.arch__node--frontend {
  border-color: rgba(0, 220, 130, 0.3);
}
.arch__node--backend {
  border-color: rgba(224, 35, 78, 0.3);
}
.arch__node--db {
  border-color: rgba(65, 105, 225, 0.35);
}
.arch__node--shared {
  border-style: dashed;
  min-width: 0;
}

.arch__node-tag {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--home-text-dim);
}
.arch__node-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--home-text-primary);
}
.arch__node-desc {
  font-size: 11px;
  line-height: 1.45;
  color: var(--home-text-soft);
  max-width: 26ch;
}
.arch__node-port {
  font-family: monospace;
  font-size: 10px;
  color: var(--home-accent);
  margin-top: 3px;
}

/* Соединители: вертикальная линия со стрелкой и подписью сбоку. */
.arch__link {
  position: relative;
  width: 1px;
  height: 34px;
  background: var(--home-border-subtle);
  flex-shrink: 0;
}
.arch__link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 5px;
  height: 5px;
  border-right: 1px solid var(--home-text-dim);
  border-bottom: 1px solid var(--home-text-dim);
  transform: translate(-50%, 1px) rotate(45deg);
}
.arch__link-label {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 10px;
  color: var(--home-text-dim);
}

/* Горизонтальный соединитель между Nuxt и Nest. */
.arch__link--h {
  width: 84px;
  height: 1px;
}
.arch__link--h::after {
  bottom: auto;
  left: auto;
  right: 0;
  top: 50%;
  transform: translate(1px, -50%) rotate(-45deg);
}
.arch__link--h .arch__link-label {
  left: 50%;
  top: -15px;
  transform: translateX(-50%);
  /* подложка под линией: подпись короче соединителя не всегда,
     фон не даёт ей слиться с линией */
  background: var(--home-surface-deep);
  padding: 0 4px;
}

.arch__row {
  display: flex;
  align-items: center;
}

/* Ветка к БД: сдвигаем от центра схемы вправо, под узел NestJS.
   Половина соединителя (42px) + половина узла (95px) = 137px. */
.arch__db-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 274px; /* 2 × 137 — align-items: center у .arch съедает половину */
}

.arch__node--shared {
  margin-top: 26px;
  border-style: dashed;
}
.arch__shared-users {
  font-family: monospace;
  font-size: 10px;
  color: var(--home-text-dim);
  margin-top: 4px;
}

.arch__wrapper-label {
  position: absolute;
  bottom: 10px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--home-text-dim);
}

@media (max-width: 700px) {
  /* На узком экране горизонтальная связка Nuxt→Nest не помещается —
     разворачиваем ряд в колонку, соединитель становится вертикальным. */
  .arch__row {
    flex-direction: column;
    width: 100%;
  }
  .arch__node {
    min-width: 0;
    width: 100%;
  }
  .arch__link--h {
    width: 1px;
    height: 34px;
  }
  .arch__link--h::after {
    bottom: 0;
    top: auto;
    left: 50%;
    right: auto;
    transform: translate(-50%, 1px) rotate(45deg);
  }
  .arch__link--h .arch__link-label {
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .arch__db-branch {
    margin-left: 0;
    width: 100%;
  }
  .arch__wrapper-label {
    position: static;
    margin-top: 16px;
  }
  .arch {
    padding: 20px 16px;
  }
}
</style>
