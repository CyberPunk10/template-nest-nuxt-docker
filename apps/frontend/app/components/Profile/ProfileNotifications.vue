<script setup lang="ts">
const { t } = useI18n()

const notifications = reactive({
  email: true,
  security: true,
  updates: false,
  digest: false,
})
</script>

<template>
  <section class="card">
    <h2 class="card__title">
      <Icon name="lucide:bell" size="15" class="card__icon" />
      {{ t('profile.notifications.title') }}
    </h2>
    <div class="toggles">
      <div
        v-for="key in ['email', 'security', 'updates', 'digest'] as const"
        :key="key"
        class="toggle-row"
      >
        <div class="toggle-row__info">
          <span class="toggle-row__name">{{ t(`profile.notifications.${key}.name`) }}</span>
          <span class="toggle-row__desc">{{ t(`profile.notifications.${key}.desc`) }}</span>
        </div>
        <button
          class="toggle"
          :class="{ 'toggle--on': notifications[key] }"
          @click="notifications[key] = !notifications[key]"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
$bg-card: #0b1525;
$border: #1e293b;
$border-sub: #111d30;
$text-dim: #64748b;
$text-secondary: #cbd5e1;
$text-faint: #475569;
$green: #00dc82;

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

.toggles {
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

.toggle-row {
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
  &__desc {
    font-size: 11px;
    color: $text-faint;
  }
}

.toggle {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: $border;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: $text-faint;
    transition:
      transform 0.2s,
      background 0.2s;
  }

  &--on {
    background: rgba(0, 220, 130, 0.2);

    &::after {
      transform: translateX(16px);
      background: $green;
    }
  }
}
</style>
