<script setup lang="ts">
defineProps<{
  sessions: {
    device: string
    location: string
    time: string
    current: boolean
  }[]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="card">
    <h2 class="card__title">
      <Icon name="lucide:monitor" size="15" class="card__icon" />
      {{ t('profile.sessions.title') }}
    </h2>
    <div class="sessions">
      <div v-for="s in sessions" :key="s.device" class="session">
        <div class="session__dot" :class="{ 'session__dot--active': s.current }" />
        <div class="session__info">
          <span class="session__device">
            {{ s.device }}
            <span v-if="s.current" class="session__badge">{{ t('profile.sessions.current') }}</span>
          </span>
          <span class="session__meta">{{ s.location }} · {{ s.time }}</span>
        </div>
        <button v-if="!s.current" class="session__revoke">
          {{ t('profile.sessions.revoke') }}
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
$text-secondary: #cbd5e1;
$text-faint: #475569;
$text-dark: #334155;
$green: #00dc82;
$red: #ef4444;

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

.sessions {
  display: flex;
  flex-direction: column;

  & > * {
    padding: 11px 0;
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

.session {
  display: flex;
  align-items: center;
  gap: 12px;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $text-dark;
    flex-shrink: 0;

    &--active {
      background: $green;
      box-shadow: 0 0 6px rgba(0, 220, 130, 0.5);
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__device {
    font-size: 13px;
    color: $text-secondary;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__meta {
    font-size: 11px;
    color: $text-faint;
  }

  &__badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: rgba(0, 220, 130, 0.12);
    color: $green;
    border-radius: 4px;
    padding: 2px 5px;
  }

  &__revoke {
    background: transparent;
    border: none;
    font-size: 11px;
    color: $text-dark;
    cursor: pointer;
    transition: color 0.15s;
    padding: 0;
    font-family: inherit;

    &:hover {
      color: $red;
    }
  }
}
</style>
