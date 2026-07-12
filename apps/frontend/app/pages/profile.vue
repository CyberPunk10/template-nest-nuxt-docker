<script setup lang="ts">
const { t } = useI18n()

const avatar = 'J'
const user = { name: 'John Doe', email: 'john@example.com', id: 'a1b2c3d4' }

const stats = computed(() => [
  { label: t('profile.stats.sessions'), value: '24' },
  { label: t('profile.stats.activeDays'), value: '12' },
  { label: t('profile.stats.apiRequests'), value: '1 842' },
  { label: t('profile.stats.devices'), value: '3' },
])

const sessions = [
  { device: 'Chrome · macOS', location: 'Москва, RU', time: 'Сейчас', current: true },
  { device: 'Safari · iPhone', location: 'Москва, RU', time: '2 ч. назад', current: false },
  {
    device: 'Firefox · Linux',
    location: 'Санкт-Петербург, RU',
    time: '5 дн. назад',
    current: false,
  },
]
</script>

<template>
  <div class="profile-page">
    <div class="demo-banner">
      <Icon name="lucide:flask-conical" size="14" />
      {{ t('profile.demoBanner') }}
    </div>

    <ProfileHero
      :avatar="avatar"
      :name="user.name"
      :email="user.email"
    />

    <div class="body">
      <ProfileStats :stats="stats" />

      <div class="cols">
        <div class="col">
          <ProfileInfoForm />
          <ProfileNotifications />
        </div>
        <div class="col">
          <ProfileSecurity />
          <ProfileSessions :sessions="sessions" />
          <ProfileAccount :user-id="user.id" />
        </div>
      </div>

      <ProfileDanger />
    </div>
  </div>
</template>

<style scoped lang="scss">
$bg-page: #080f1a;
$text-body: #e2e8f0;

.demo-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(234, 179, 8, 0.08);
  border-bottom: 1px solid rgba(234, 179, 8, 0.2);
  color: #ca8a04;
  font-size: 12px;
  padding: 10px 32px;
}

.profile-page {
  flex: 1;
  background: $bg-page;
  color: var(--text-primary);
  font-family: system-ui, sans-serif;
}

.body {
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
