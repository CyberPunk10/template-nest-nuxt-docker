<script setup lang="ts">
import { useSidebar } from '../../composables/useSidebar'
import Trigger from './Trigger.vue'
import Menu from './Menu.vue'
import ThemePopup from './ThemePopup.vue'

const { user, logout } = useAuth()
const { isCollapsed } = useSidebar()
const { t } = useI18n()

const avatar = computed(() => user.value?.name.charAt(0).toUpperCase() ?? '?')

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const themeOpen = ref(false)
let themeCloseTimer: ReturnType<typeof setTimeout> | null = null

function openTheme() {
  if (themeCloseTimer) clearTimeout(themeCloseTimer)
  themeOpen.value = true
}

function closeTheme() {
  themeCloseTimer = setTimeout(() => {
    themeOpen.value = false
  }, 150)
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (!menuOpen.value) themeOpen.value = false
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
  <div
    ref="menuRef"
    class="sidebar-profile"
    :class="{ '--collapsed': isCollapsed }"
  >
    <Trigger
      :avatar="avatar"
      :name="user?.name"
      :email="user?.email"
      :open="menuOpen"
      @click="toggleMenu"
    />

    <Menu v-if="menuOpen" @close="menuOpen = false">
      <template #theme>
        <ThemePopup
          :show="themeOpen"
          @open="openTheme"
          @close="closeTheme"
        />
      </template>

      <template #logout>
        <button
          class="sidebar-profile__menu-item sidebar-profile__menu-item--danger"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" size="14" />
          {{ t('userMenu.logout') }}
        </button>
      </template>
    </Menu>
  </div>
</template>

<style lang="scss">
.sidebar-profile {
  position: relative;
  padding: var(--space-0-5) var(--space-2) var(--space-1);
}
</style>
