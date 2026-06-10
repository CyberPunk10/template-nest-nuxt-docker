<script setup lang="ts">
defineProps<{ userId: string | undefined }>()

const { t } = useI18n()
</script>

<template>
  <section class="card">
    <div class="rows">
      <div class="row">
        <span class="row__key">{{ t('profile.account.userId') }}</span>
        <span class="row__val row__val--mono">{{ userId?.slice(0, 8) }}…</span>
      </div>
      <div class="row">
        <span class="row__key">{{ t('profile.account.registeredAt') }}</span>
        <span class="row__val">{{ t('profile.account.registeredAtValue') }}</span>
      </div>
      <div class="row">
        <span class="row__key">{{ t('profile.account.plan') }}</span>
        <span class="row__val">
          <span class="plan-badge">Pro</span>
        </span>
      </div>
      <div class="row">
        <span class="row__key">{{ t('profile.account.timezone') }}</span>
        <span class="row__val">Europe/Moscow (UTC+3)</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
$border: #1e293b;
$border-flat: #1a2740;
$border-sub: #111d30;
$text-muted: #94a3b8;
$text-faint: #475569;

.card {
  background: transparent;
  border: 1px solid $border-flat;
  border-radius: 10px;
  padding: 20px;
}

.rows {
  display: flex;
  flex-direction: column;

  & > * {
    padding: 10px 0;
    border-bottom: 1px solid $border-sub;

    &:last-child {
      border-bottom: none;
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

  &__key {
    font-size: 12px;
    color: $text-faint;
  }

  &__val {
    font-size: 12px;
    color: $text-muted;
    display: flex;
    align-items: center;
    gap: 6px;

    &--mono {
      font-family: monospace;
      font-size: 11px;
    }
  }
}

.plan-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
}
</style>
