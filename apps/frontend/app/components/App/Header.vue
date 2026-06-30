<script setup lang="ts">
const { user, logout } = useAuth()
const { locale, locales, setLocale } = useI18n()
const avatar = computed(() => user.value?.name.charAt(0).toUpperCase() ?? '?')

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

async function handleLogout() {
  try {
    await logout()
  } catch (e) {
    console.log('logout error', e)
  }
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
    <div class="header__right">
      <div class="header__locale">
        <button
          v-for="loc in locales"
          :key="loc.code"
          class="header__locale-btn"
          :class="{ 'header__locale-btn--active': locale === loc.code }"
          @click="setLocale(loc.code)"
        >
          {{ loc.code.toUpperCase() }}
        </button>
      </div>
      <div ref="menuRef" class="header__user">
        <button class="header__trigger" @click="toggleMenu">
          <div class="header__avatar">{{ avatar }}</div>
          <div class="header__info">
            <span class="header__name">{{ user?.name }}</span>
            <span class="header__email">{{ user?.email }}</span>
          </div>
          <Icon
            name="lucide:chevron-down"
            size="14"
            class="header__chevron"
            :class="{ 'header__chevron--open': menuOpen }"
          />
        </button>
        <div v-if="menuOpen" class="header__menu">
          <NuxtLink
            class="header__menu-item"
            to="/profile"
            @click="menuOpen = false"
          >
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
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: var(--app-header-height);
  background: var(--surface-app);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--space-5);

  &__sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    padding: var(--space-1-5);
    color: #334155;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: #64748b;
    }
  }

  &__locale {
    display: flex;
    gap: 2px;
  }

  &__locale-btn {
    background: transparent;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 600;
    padding: 3px 6px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s;

    &:hover {
      border-color: var(--text-muted);
      color: #94a3b8;
    }

    &--active {
      border-color: var(--accent);
      color: var(--accent);
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__user {
    position: relative;
  }

  &__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    padding: 5px 8px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;

    &:hover {
      border-color: var(--border-subtle);
      background: var(--control-hover);
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--accent);
    color: var(--surface-app);
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
    color: var(--text-primary);
    line-height: 1;
  }

  &__email {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1;
  }

  &__chevron {
    color: var(--text-muted);
    transition: transform var(--duration-normal);
    flex-shrink: 0;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + var(--space-1-5));
    right: 0;
    min-width: 180px;
    background: var(--border-subtle);
    border: 1px solid #334155;
    border-radius: var(--radius-lg);
    padding: var(--space-1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &__menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-2-5);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    text-decoration: none;
    transition:
      background var(--duration-fast),
      color var(--duration-fast);
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
    margin: var(--space-1) 0;
  }
}
</style>
