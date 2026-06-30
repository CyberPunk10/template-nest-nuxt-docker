<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const { t } = useI18n()

const show = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function open() {
  if (closeTimer) clearTimeout(closeTimer)
  show.value = true
}

function close() {
  closeTimer = setTimeout(() => {
    show.value = false
  }, 150)
}
</script>

<template>
  <div
    class="sidebar-user__lang"
    @mouseenter="open"
    @mouseleave="close"
  >
    <button class="sidebar-user__item">
      <Icon name="lucide:languages" size="14" />
      {{ t('userMenu.language') }}
      <Icon
        name="lucide:chevron-right"
        size="12"
        class="sidebar-user__item-icon sidebar-user__item-chevron"
      />
    </button>

    <div v-if="show" class="sidebar-user__lang-dropdown">
      <div class="sidebar-user__lang-dropdown-inner">
        <button
          v-for="loc in locales"
          :key="loc.code"
          class="sidebar-user__item"
          :class="{ 'sidebar-user__item--active': locale === loc.code }"
          @click="setLocale(loc.code)"
        >
          {{ t(`locales.${loc.code}`) }}
          <Icon
            v-if="locale === loc.code"
            name="lucide:check"
            size="12"
            class="sidebar-user__item-icon"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.sidebar-user {
  &__lang {
    position: relative;

    .sidebar-user__item {
      margin-bottom: var(--space-0-5);
    }

    &:hover > .sidebar-user__item {
      background: var(--control-hover);
      color: var(--text-primary);
    }

    &-dropdown {
      position: absolute;
      bottom: 0;
      left: calc(100% + var(--space-1-5));
      padding-left: 4px;
      z-index: var(--z-raised);

      &::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
      }

      &-inner {
        width: 10.625rem;
        background: var(--surface-popover);
        border: 1px solid var(--border-popover);
        border-radius: var(--radius-lg);
        padding: var(--space-1);
        box-shadow: var(--shadow-md);
      }
    }
  }
}
</style>
