<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="card">
    <h2 class="card__title">
      <Icon name="lucide:triangle-alert" size="15" class="card__icon" />
      {{ t('profile.danger.title') }}
    </h2>
    <div class="row">
      <div>
        <p class="row__name">{{ t('profile.danger.deleteAccount') }}</p>
        <p class="row__desc">{{ t('profile.danger.deleteDesc') }}</p>
      </div>
      <button class="btn btn--danger">{{ t('profile.danger.deleteAction') }}</button>
    </div>
  </section>
</template>

<style scoped lang="scss">
$red: #ef4444;
$text-secondary: #cbd5e1;
$text-faint: #475569;

.card {
  background: rgba(239, 68, 68, 0.03);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 10px;
  padding: 20px;

  &__title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $red;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__icon {
    opacity: 0.7;
  }
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &__name {
    font-size: 13px;
    color: $text-secondary;
    margin: 0 0 3px;
    font-weight: 500;
  }

  &__desc {
    font-size: 12px;
    color: $text-faint;
    margin: 0;
  }
}

.btn {
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;

  &--danger {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: $red;
    padding: 8px 16px;
    transition: background 0.15s;

    &:hover {
      background: rgba(239, 68, 68, 0.08);
    }
  }
}
</style>
