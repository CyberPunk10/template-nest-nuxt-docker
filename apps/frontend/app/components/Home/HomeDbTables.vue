<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

interface GlobalTask {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

const { t, locale } = useI18n()

const { data: users } = await useApi<User[]>('/users', {
  default: () => [],
})

const { data: allTasks } = await useApi<GlobalTask[]>('/tasks', {
  key: QUERY_KEYS.allTasks,
  default: () => [],
})

function shortId(id: string): string {
  return id.slice(0, 8)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(locale.value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
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
      <div class="table">
        <div class="table__grid table__grid--users">
          <div class="table__head">
            <span class="col">{{ t('db.cols.id') }}</span>
            <span class="col">{{ t('db.cols.name') }}</span>
            <span class="col">{{ t('db.cols.email') }}</span>
            <span class="col col--right">{{ t('db.cols.createdAt') }}</span>
            <span class="col col--right">{{ t('db.cols.updatedAt') }}</span>
          </div>
          <div
            v-for="item in users"
            :key="item.id"
            class="table__row"
          >
            <span class="col col--id" :title="item.id">{{ shortId(item.id) }}</span>
            <span class="col col--name">{{ item.name }}</span>
            <span class="col" :title="item.email">{{ item.email }}</span>
            <span class="col col--date">{{ formatDate(item.createdAt) }}</span>
            <span class="col col--date">{{ formatDate(item.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__header">
        <span class="section__title">{{ t('tasks.title') }}</span>
        <span class="section__badge">{{ allTasks?.length ?? 0 }}</span>
      </div>
      <div class="table">
        <div class="table__grid table__grid--tasks">
          <div class="table__head">
            <span class="col">{{ t('db.cols.id') }}</span>
            <span class="col">{{ t('db.cols.title') }}</span>
            <span class="col">{{ t('db.cols.description') }}</span>
            <span class="col col--right">{{ t('db.cols.createdAt') }}</span>
            <span class="col col--right">{{ t('db.cols.updatedAt') }}</span>
          </div>
          <div
            v-for="item in allTasks"
            :key="item.id"
            class="table__row"
          >
            <span class="col col--id" :title="item.id">{{ shortId(item.id) }}</span>
            <span class="col col--name">{{ item.title }}</span>
            <span class="col col--muted" :title="item.description ?? ''">
              {{ item.description || '—' }}
            </span>
            <span class="col col--date">{{ formatDate(item.createdAt) }}</span>
            <span class="col col--date">{{ formatDate(item.updatedAt) }}</span>
          </div>
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
  color: var(--text-secondary);
  margin: 0;

  &-sub {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: var(--text-muted);
    font-style: italic;
  }
}

.section {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  background: #0d1424;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border-subtle);
  }

  &__title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    flex: 1;
  }

  &__badge {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    background: var(--border-subtle);
    border-radius: 20px;
    padding: 1px 8px;
  }
}

.table {
  // при нехватке места — горизонтальный скролл (колонки держат min-width)
  overflow-x: auto;

  &__grid {
    display: grid;
    // сетка занимает всю доступную ширину; min-width = сумма минимумов колонок,
    // поэтому при узком контейнере она не сжимается ниже него и включается скролл
    width: 100%;

    // широкая колонка = minmax(10rem, 1fr): забирает остаток, но не уже 10rem —
    // на этом минимуме длинный текст переносится на вторую строку
    // id · name · email · created · updated
    &--users {
      // 76 + 96 + 160(10rem) + 100 + 100 + паддинги ≈ 34rem
      grid-template-columns: 76px minmax(6rem, 0.6fr) minmax(10rem, 1fr) 100px 100px;
      min-width: 34rem;
    }

    // id · title · description · created · updated
    &--tasks {
      // 76 + 128 + 160 + 100 + 100 ≈ 36rem
      grid-template-columns: 76px minmax(8rem, 0.8fr) minmax(10rem, 1fr) 100px 100px;
      min-width: 36rem;
    }
  }

  // строки-обёртки прозрачны для grid: их дети становятся ячейками общей сетки,
  // поэтому колонки выровнены между всеми строками
  &__head,
  &__row {
    display: contents;
  }

  &__head .col {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    border-bottom: 1px solid var(--border-subtle);
  }

  &__row .col {
    border-bottom: 1px solid var(--border-subtle);
  }

  // граница строки = нижний бордер ячеек; убираем у последней строки
  &__row:last-child .col {
    border-bottom: none;
  }
}

.col {
  padding: 8px 6px;
  font-size: 13px;
  color: #cbd5e1;
  // длинный текст переносится на следующую строку внутри ячейки
  overflow-wrap: anywhere;
  word-break: break-word;

  &:first-child {
    padding-left: 14px;
  }

  &:last-child {
    padding-right: 14px;
  }

  &--id {
    font-family: ui-monospace, 'SFMono-Regular', 'Menlo', monospace;
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
  }

  &--name {
    text-transform: capitalize;
  }

  &--date {
    font-size: 11px;
    color: #64748b;
    text-align: right;
    white-space: nowrap;
  }

  &--right {
    text-align: right;
  }

  &--muted {
    color: #64748b;
    text-transform: none;
  }
}
</style>
