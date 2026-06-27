<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
}

interface GlobalTask {
  id: string
  title: string
  description: string | null
  user: { name: string }
}

const { t } = useI18n()

const { data: users } = await useApi<User[]>('/users', {
  default: () => [],
})

const { data: allTasks } = await useApi<GlobalTask[]>('/tasks/all', {
  key: QUERY_KEYS.allTasks,
  default: () => [],
})
</script>

<template>
  <div class="root">
    <h2 class="heading">
      {{ t('db.title') }} <span class="heading-sub">← {{ t('db.subtitle') }}</span>
    </h2>

    <div class="section">
      <div class="section__header">
        <span class="section__title">{{ t('users.title') }}</span>
        <span class="section__badge">{{ users?.length ?? 0 }}</span>
      </div>
      <div class="list">
        <div
          v-for="item in users"
          :key="item.id"
          class="list__row"
        >
          <span class="list__name">{{ item.name }}</span>
          <span class="list__email">{{ item.email }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__header">
        <span class="section__title">{{ t('tasks.title') }}</span>
        <span class="section__badge">{{ allTasks?.length ?? 0 }}</span>
      </div>
      <div class="list">
        <div
          v-for="item in allTasks"
          :key="item.id"
          class="list__row"
        >
          <span class="list__name">{{ item.title }}</span>
          <span class="list__email">{{ item.user.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.heading {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin: 0;

  &-sub {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: var(--text-tertiary-color);
    font-style: italic;
  }
}

.section {
  border: 1px solid var(--divider-color);
  border-radius: 12px;
  overflow: hidden;
  background: #0d1424;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--divider-color);
  }

  &__title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary-color);
    flex: 1;
  }

  &__badge {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    background: var(--divider-color);
    border-radius: 20px;
    padding: 1px 8px;
  }
}

.list {
  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--divider-color);

    &:last-child {
      border-bottom: none;
    }
  }

  &__name {
    font-size: 13px;
    color: #cbd5e1;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__email {
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
  }
}
</style>
