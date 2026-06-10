<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="card">
    <h2 class="card__title">
      <Icon name="lucide:shield" size="15" class="card__icon" />
      {{ t('profile.security.title') }}
    </h2>
    <div class="rows">
      <div v-for="key in ['password', 'twoFactor', 'apiKeys'] as const" :key="key" class="row">
        <div class="row__info">
          <span class="row__name">{{ t(`profile.security.${key}.name`) }}</span>
          <span class="row__sub" :class="{ 'row__sub--off': key === 'twoFactor' }">
            {{ t(`profile.security.${key}.sub`) }}
          </span>
        </div>
        <button class="btn btn--ghost btn--sm">
          {{ t(`profile.security.${key}.action`) }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
$bg-card: #0b1525;
$border: #1e293b;
$border-sub: #111d30;
$text-dim: #64748b;
$text-muted: #94a3b8;
$text-secondary: #cbd5e1;
$text-faint: #475569;
$text-dark: #334155;
$red-dark: #dc2626;

.card {
  background: $bg-card;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px;

  &__title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $text-dim;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__icon {
    opacity: 0.7;
  }
}

.rows {
  display: flex;
  flex-direction: column;

  & > * {
    padding: 12px 0;
    border-bottom: 1px solid $border-sub;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    &:first-child {
      padding-top: 0;
    }
  }
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 13px;
    color: $text-secondary;
  }

  &__sub {
    font-size: 11px;
    color: $text-faint;

    &--off {
      color: $red-dark;
    }
  }
}

.btn {
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.15s,
    color 0.15s;

  &--ghost {
    background: transparent;
    border: 1px solid $border;
    color: $text-dim;
    padding: 6px 12px;

    &:hover {
      border-color: $text-dark;
      color: $text-muted;
    }
  }

  &--sm {
    font-size: 12px;
    padding: 5px 10px;
  }
}
</style>
