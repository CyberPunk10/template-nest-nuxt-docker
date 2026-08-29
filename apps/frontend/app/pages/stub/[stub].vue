<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const stub = computed(() => route.params.stub as string)

const shapes = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 40 + ((i * 17) % 80),
  x: (i * 137.5) % 100,
  y: (i * 97.3) % 100,
  delay: (i * 0.3) % 3,
  duration: 4 + ((i * 0.7) % 4),
  opacity: 0.03 + ((i * 0.015) % 0.07),
}))
</script>

<template>
  <div class="stub">
    <div class="stub__bg">
      <div
        v-for="s in shapes"
        :key="s.id"
        class="stub__shape"
        :style="{
          width: `${s.size}px`,
          height: `${s.size}px`,
          left: `${s.x}%`,
          top: `${s.y}%`,
          opacity: s.opacity,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`,
        }"
      />
    </div>

    <div class="stub__content">
      <div class="stub__icon">
        <Icon name="lucide:construction" size="32" />
      </div>

      <h1 class="stub__title">{{ t('stub.title') }}</h1>

      <p class="stub__desc">{{ t('stub.desc') }}</p>

      <div class="stub__meta">
        <div class="stub__meta-row">
          <span class="stub__meta-label">{{ t('stub.route') }}</span>
          <code class="stub__meta-value">{{ route.path }}</code>
        </div>
        <div class="stub__meta-row">
          <span class="stub__meta-label">section</span>
          <code class="stub__meta-value">{{ stub }}</code>
        </div>
      </div>

      <NuxtLink to="/" class="stub__back">
        <Icon name="lucide:arrow-left" size="14" />
        {{ t('stub.back') }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stub {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__shape {
    position: absolute;
    border-radius: 50%;
    background: var(--accent);
    animation: float linear infinite;
    transform: translate(-50%, -50%);
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
    padding: 48px 32px;
    max-width: 480px;
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: rgba(0, 220, 130, 0.08);
    border: 1px solid rgba(0, 220, 130, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.02em;
  }

  &__desc {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.7;
    margin: 0;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #0b1525;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 10px 14px;
  }

  &__meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__meta-label {
    font-size: 11px;
    font-weight: 600;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex-shrink: 0;
    width: 56px;
  }

  &__meta-value {
    font-size: 13px;
    font-family: monospace;
    color: var(--accent);
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
    text-decoration: none;
    padding: 8px 14px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    transition:
      color 0.15s,
      border-color 0.15s;
    margin-top: 4px;

    &:hover {
      color: var(--text-primary);
      border-color: #334155;
    }
  }
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -60%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
