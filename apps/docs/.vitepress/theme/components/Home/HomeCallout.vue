<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

/**
 * Призыв «начните с идей, а не с настройки». Три оформления стоят на разных
 * участках страницы: одна и та же мысль подаётся по-разному в зависимости от
 * того, что читатель только что прочёл.
 *
 *   type  — под hero: типографика без рамки, работает только шрифтом;
 *   split — после честного разбора «кому подходит»: аргумент через контраст;
 *   steps — перед «Быстрым стартом»: шкала пройденных этапов подводит к нему.
 */
const props = defineProps<{ variant: 'split' | 'steps' | 'type' }>()

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress),
// без vue-i18n. theme меняется при смене языка — компонент перерисовывается.
const { theme } = useData()
const callout = computed(() => theme.value.home!.callout)
const v = computed(() => callout.value[props.variant])
</script>

<template>
  <!-- ── Развилка: слева то, чем вы не занимаетесь, справа — чем вместо этого.
       Показывает выгоду контрастом, а не декларацией: после честного разбора
       «кому не подходит» аргумент звучит убедительнее лозунга. -->
  <section v-if="variant === 'split'" class="split">
    <div class="split__side split__side--without">
      <span class="split__label">{{ v.withoutLabel }}</span>
      <ul class="split__list">
        <li v-for="item in v.without" :key="item">
          <Icon name="lucide:x-circle" size="14" />
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="split__arrow" aria-hidden="true">
      <Icon name="lucide:arrow-right" size="18" />
    </div>
    <div class="split__side split__side--with">
      <span class="split__label">{{ v.withLabel }}</span>
      <ul class="split__list">
        <li v-for="item in v.with" :key="item">
          <Icon name="lucide:check-circle" size="14" />
          {{ item }}
        </li>
      </ul>
    </div>
  </section>

  <!-- ── Шкала: три этапа шаблон уже прошёл за вас, вы начинаете с четвёртого.
       Стоит вплотную к «Быстрому старту», поэтому зачёркнутые шаги переходят
       в пронумерованные шаги установки — смысловая рифма. -->
  <section v-else-if="variant === 'steps'" class="steps">
    <ol class="steps__track">
      <li
        v-for="(step, i) in v.stages"
        :key="step"
        class="steps__step"
        :class="i === v.stages.length - 1 ? 'steps__step--now' : 'steps__step--done'"
      >
        <span class="steps__bar" />
        <span class="steps__cap">{{ step }}</span>
      </li>
    </ol>
    <p class="steps__text">
      <strong>{{ v.done }}</strong>
      <span>{{ v.text }}</span>
    </p>
  </section>

  <!-- ── Типографика: ни рамки, ни иконки. Зачёркивание дорисовывается
       CSS-анимацией, без JS-обсерверов.

       Конструкция: общий зачин, под ним два одинаково начинающихся
       продолжения — одно вычеркнуто, второе остаётся. Параллельные строки
       и держат приём: читатель видит выбор, а не одну длинную фразу. -->
  <section v-else class="typeset">
    <p class="typeset__line">
      <span class="typeset__call">{{ v.call }}</span>
      <span class="typeset__option typeset__struck">{{ v.struck }}</span>
      <span class="typeset__option typeset__kept">
        {{ v.kept }}<span class="typeset__accent">{{ v.accent }}</span>
      </span>
    </p>
  </section>
</template>

<style scoped>
/* ─────────────────────────  split  ───────────────────────── */
.split {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  border: 1px solid var(--home-border-subtle);
  border-radius: 12px;
  overflow: hidden;
}
.split__side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 26px;
}
.split__side--without {
  background: var(--home-surface-2);
}
/* Единственная акцентная заливка секции — на той стороне, куда мы ведём. */
.split__side--with {
  background: color-mix(in srgb, var(--home-accent) 7%, transparent);
}
.split__label {
  font-size: var(--home-text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--home-text-dim);
}
.split__side--with .split__label {
  color: var(--home-accent);
}
.split__list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.split__list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: var(--home-text-sm);
  line-height: var(--home-leading-normal);
  color: var(--home-text-dim);
}
.split__side--with .split__list li {
  color: var(--home-text-soft);
}
.split__list :deep(svg) {
  flex-shrink: 0;
  margin-top: 3px;
}
.split__side--with .split__list :deep(svg) {
  color: var(--home-accent);
}
.split__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  background: var(--home-surface-2);
  border-left: 1px solid var(--home-border-subtle);
  border-right: 1px solid var(--home-border-subtle);
  color: var(--home-text-dim);
}

/* ─────────────────────────  steps  ───────────────────────── */
.steps {
  border: 1px solid var(--home-border-subtle);
  border-radius: 12px;
  background: var(--home-surface-2);
  padding: 22px 26px 24px;
}
.steps__track {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}
.steps__step {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}
.steps__bar {
  height: 4px;
  border-radius: 2px;
  background: var(--home-border-2);
}
.steps__step--done .steps__bar {
  background: color-mix(in srgb, var(--home-accent) 35%, transparent);
}
.steps__step--now .steps__bar {
  background: var(--home-accent);
}
.steps__cap {
  font-size: var(--home-text-xs);
  color: var(--home-text-dim);
}
/* Зачёркнутые этапы — то, что шаблон снял с вас; последний — ваш. */
.steps__step--done .steps__cap {
  color: var(--home-text-muted);
  text-decoration: line-through;
}
.steps__step--now .steps__cap {
  color: var(--home-accent);
  font-weight: 700;
}
.steps__text {
  font-size: var(--home-text-lg);
  line-height: var(--home-leading-tight);
  letter-spacing: var(--home-tracking-tight);
  margin: 0;
}
.steps__text strong {
  font-weight: 600;
  color: var(--home-text-strong);
}
.steps__text span {
  color: var(--home-text-muted);
  font-weight: 400;
}

/* ─────────────────────────  typeset  ───────────────────────── */
.typeset {
  padding: 8px 0;
}
/* Строки складывает flex, а не <br>: так у вариантов общий отступ слева
   и одинаковый ритм — противопоставление держится на выравнивании. */
.typeset__line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: var(--home-text-2xl);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.03em;
  margin: 0;
}
/* Зачин стоит ступенью тише вариантов: он вводит выбор, а не спорит с ним. */
.typeset__call {
  color: var(--home-text-muted);
  margin-bottom: 4px;
}
.typeset__option {
  display: inline-block;
}
.typeset__kept {
  color: var(--home-text-strong);
}
.typeset__accent {
  color: var(--home-accent);
}
/* Зачёркивание рисуется псевдоэлементом, а не <s>: линию нужно вести
   акцентом и анимировать, а декоративный текст-декор этого не даёт. */
.typeset__struck {
  position: relative;
  white-space: nowrap;
  color: var(--home-text-dim);
}
/* Тонкая линия: толстая перекрывает строчные и текст под ней не читается. */
.typeset__struck::after {
  content: '';
  position: absolute;
  left: -0.04em;
  right: -0.04em;
  top: 55%;
  height: 2px;
  border-radius: 1px;
  background: var(--home-accent);
  transform: scaleX(0);
  transform-origin: left;
  animation: callout-strike 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) 0.3s forwards;
}
@keyframes callout-strike {
  to {
    transform: scaleX(1);
  }
}

/* ─────────────────────────  адаптив  ───────────────────────── */
@media (max-width: 700px) {
  .split {
    grid-template-columns: 1fr;
  }
  /* Стрелка вправо между колонками теряет смысл, когда колонки встают
     друг под друга: на узком экране порядок задаёт сама вертикаль. */
  .split__arrow {
    display: none;
  }
  .split__side--without {
    border-bottom: 1px solid var(--home-border-subtle);
  }
  .steps__track {
    gap: 6px;
  }
  .steps__cap {
    font-size: 10px;
  }
}

/* Анимация зачёркивания — декоративная. */
@media (prefers-reduced-motion: reduce) {
  .typeset__struck::after {
    animation: none;
    transform: scaleX(1);
  }
}
</style>
