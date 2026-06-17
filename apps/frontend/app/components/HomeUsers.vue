<script setup lang="ts">
import { UiCard, UiButton } from '@repo/ui'

interface User {
  id: string
  name: string
  email: string
}

const { t, locale, locales, setLocale } = useI18n()

const users = ref<User[]>([
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
])

const form = reactive({ name: '', email: '' })
const editingId = ref<string | null>(null)
const editForm = reactive({ name: '', email: '' })

function startEdit(user: User) {
  editingId.value = user.id
  editForm.name = user.name
  editForm.email = user.email
}

function cancelEdit() {
  editingId.value = null
}

function saveEdit(id: string) {
  console.log('saveEdit', id, { ...editForm })
  editingId.value = null
}

function createUser() {
  console.log('createUser', { ...form })
  form.name = ''
  form.email = ''
}

function removeUser(id: string) {
  console.log('removeUser', id)
}
</script>

<template>
  <div class="header">
    <h2 class="heading">
      {{ t('users.title') }} <span class="heading-sub">← {{ t('users.subtitle') }}</span>
    </h2>
    <div class="locale-switcher">
      <button
        v-for="loc in locales"
        :key="loc.code"
        class="locale-btn"
        :class="{ 'locale-btn--active': locale === loc.code }"
        @click="setLocale(loc.code)"
      >
        {{ loc.code.toUpperCase() }}
      </button>
    </div>
  </div>

  <UiCard :title="t('users.create')">
    <form class="form" @submit.prevent="createUser">
      <input v-model="form.name" class="form__input" :placeholder="t('users.name')" />
      <input v-model="form.email" class="form__input" placeholder="Email" />
      <UiButton type="submit">{{ t('users.add') }}</UiButton>
    </form>
  </UiCard>

  <UiCard :title="t('users.list')">
    <div v-if="!users.length" class="empty">{{ t('users.empty') }}</div>
    <div v-else class="users">
      <div v-for="user in users" :key="user.id" class="user">
        <template v-if="editingId === user.id">
          <form class="user__edit" @submit.prevent="saveEdit(user.id)">
            <input
              v-model="editForm.name"
              class="form__input form__input--sm"
              :placeholder="t('users.name')"
            />
            <input
              v-model="editForm.email"
              class="form__input form__input--sm"
              placeholder="Email"
            />
            <div class="user__edit-actions">
              <UiButton type="submit" variant="ghost">
                <Icon name="lucide:check" size="14" />
              </UiButton>
              <UiButton variant="ghost" @click="cancelEdit">
                <Icon name="lucide:x" size="14" />
              </UiButton>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="user__info" @click="startEdit(user)">
            <span class="user__name">{{ user.name }}</span>
            <span class="user__email">{{ user.email }}</span>
          </div>
          <UiButton variant="danger" @click="removeUser(user.id)">
            <Icon name="lucide:trash-2" size="14" />
          </UiButton>
        </template>
      </div>
    </div>
  </UiCard>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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
    color: #475569;
    font-style: italic;
  }
}

.locale-switcher {
  display: flex;
  gap: 2px;
}

.locale-btn {
  background: transparent;
  border: 1px solid #1e293b;
  border-radius: 6px;
  color: #475569;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 6px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: #475569;
    color: #94a3b8;
  }

  &--active {
    border-color: #00dc82;
    color: #00dc82;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__input {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #00dc82;
    }

    &--sm {
      padding: 5px 10px;
      font-size: 12px;
    }
  }
}

.empty {
  font-size: 13px;
  color: #475569;
}

.users {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
    cursor: pointer;
    border-radius: 6px;
    padding: 4px 6px;
    margin: -4px -6px;
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  }

  &__edit {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__edit-actions {
    display: flex;
    gap: 4px;
  }

  &__name {
    font-size: 13px;
    color: #e2e8f0;
    text-transform: capitalize;
  }

  &__email {
    font-size: 11px;
    color: #475569;
  }
}
</style>
