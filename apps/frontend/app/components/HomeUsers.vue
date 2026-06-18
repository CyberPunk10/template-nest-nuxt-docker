<script setup lang="ts">
import { UiCard, UiButton } from '@repo/ui'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

const { t } = useI18n()
const { $api } = useNuxtApp()
const { user } = useAuth()

const { data: users, refresh } = await useApi<User[]>('/users', {
  default: () => [],
})

const form = reactive({ name: '', email: '' })
const editingId = ref<string | null>(null)
const editForm = reactive({ name: '', email: '' })

async function createUser() {
  try {
    await $api('/auth/register', {
      method: 'POST',
      body: { name: form.name, email: form.email, password: 'demo1234' },
    })
    user.value = await $api('/auth/me')
    form.name = ''
    form.email = ''
    await refresh()
  } catch (e) {
    console.log('createUser error', e)
  }
}

function startEdit(user: User) {
  editingId.value = user.id
  editForm.name = user.name
  editForm.email = user.email
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: string) {
  try {
    const result = await $api(`/users/${id}`, {
      method: 'PUT',
      body: { name: editForm.name, email: editForm.email },
    })
    console.log('saveEdit response', result)
    editingId.value = null
    await refresh()
  } catch (e) {
    console.log('saveEdit error', e)
  }
}

async function removeUser(id: string) {
  try {
    const result = await $api(`/users/${id}`, { method: 'DELETE' })
    console.log('removeUser response', result)
    await refresh()
  } catch (e) {
    console.log('removeUser error', e)
  }
}
</script>

<template>
  <h2 class="heading">
    {{ t('users.title') }} <span class="heading-sub">← {{ t('users.subtitle') }}</span>
  </h2>

  <UiCard :title="t('users.create')">
    <form class="form" @submit.prevent="createUser">
      <input v-model="form.name" class="form__input" :placeholder="t('users.name')" />
      <input v-model="form.email" class="form__input" placeholder="Email" />
      <UiButton type="submit">{{ t('users.add') }}</UiButton>
    </form>
  </UiCard>

  <UiCard :title="t('users.list')">
    <div v-if="!users?.length" class="empty">{{ t('users.empty') }}</div>
    <div v-else class="users">
      <div v-for="item in users" :key="item.id" class="user">
        <template v-if="editingId === item.id">
          <form class="user__edit" @submit.prevent="saveEdit(item.id)">
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
          <div class="user__info" @click="startEdit(item)">
            <span class="user__name">{{ item.name }}</span>
            <span class="user__email">{{ item.email }}</span>
          </div>
          <UiButton variant="danger" @click="removeUser(item.id)">
            <Icon name="lucide:trash-2" size="14" />
          </UiButton>
        </template>
      </div>
    </div>
  </UiCard>
</template>

<style scoped lang="scss">
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
