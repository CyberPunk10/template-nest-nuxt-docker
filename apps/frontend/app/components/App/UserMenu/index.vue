<script setup lang="ts">
import { useSidebar } from '~/components/App/Sidebar/composables/useSidebar'
import UserMenuTrigger from './UserMenuTrigger.vue'
import UserMenuDropdown from './UserMenuDropdown.vue'

const { user } = useAuth()
const { isCollapsed } = useSidebar()

const avatar = computed(() => user.value?.name.charAt(0).toUpperCase() ?? '?')

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
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
    class="user-menu"
    :class="{ '--collapsed': isCollapsed }"
  >
    <UserMenuTrigger
      :avatar="avatar"
      :name="user?.name"
      :email="user?.email"
      :open="menuOpen"
      @click="toggleMenu"
    />

    <UserMenuDropdown v-if="menuOpen" @close="menuOpen = false" />
  </div>
</template>

<style lang="scss">
.user-menu {
  position: relative;
  padding: var(--space-0-5) var(--space-2) var(--space-1);
}
</style>
