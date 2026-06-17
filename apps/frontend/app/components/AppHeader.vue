<script setup lang="ts">
const user = { name: 'John Doe', email: 'john@example.com' }
const avatar = user.name.charAt(0).toUpperCase()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function handleLogout() {
  console.log('logout')
}

function onDocumentClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick, true))
onUnmounted(() => document.removeEventListener('click', onDocumentClick, true))
</script>

<template>
  <header class="header">
    <div ref="menuRef" class="header__user">
      <button class="header__trigger" @click="toggleMenu">
        <div class="header__avatar">{{ avatar }}</div>
        <div class="header__info">
          <span class="header__name">{{ user.name }}</span>
          <span class="header__email">{{ user.email }}</span>
        </div>
        <Icon
          name="lucide:chevron-down"
          size="14"
          class="header__chevron"
          :class="{ 'header__chevron--open': menuOpen }"
        />
      </button>
      <div v-if="menuOpen" class="header__menu">
        <NuxtLink class="header__menu-item" to="/profile" @click="menuOpen = false">
          <Icon name="lucide:user" size="14" />
          Профиль
        </NuxtLink>
        <div class="header__menu-divider" />
        <button class="header__menu-item header__menu-item--danger" @click="handleLogout">
          <Icon name="lucide:log-out" size="14" />
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 52px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;

  &__user {
    position: relative;
  }

  &__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 5px 8px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;

    &:hover {
      border-color: #1e293b;
      background: rgba(255, 255, 255, 0.03);
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #00dc82;
    color: #0f172a;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    text-align: left;
  }

  &__name {
    font-size: 13px;
    color: #e2e8f0;
    line-height: 1;
  }

  &__email {
    font-size: 11px;
    color: #475569;
    line-height: 1;
  }

  &__chevron {
    color: #475569;
    transition: transform 0.2s;
    flex-shrink: 0;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &__menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    text-decoration: none;
    transition:
      background 0.1s,
      color 0.1s;
    text-align: left;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #e2e8f0;
    }

    &--danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  &__menu-divider {
    height: 1px;
    background: #334155;
    margin: 4px 0;
  }
}
</style>
