<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import UserMenuTrigger from './UserMenuTrigger.vue'
import UserMenuDropdown from './UserMenuDropdown.vue'

withDefaults(defineProps<{ context?: 'sidebar' | 'header' }>(), {
  context: 'sidebar',
})

const { user } = useUserMock()

const avatar = computed(() => user.value?.name.charAt(0).toUpperCase() ?? '?')

const menuOpen = ref(false)
const menuRef = useTemplateRef('menu')

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

onClickOutside(menuRef, () => {
  menuOpen.value = false
})
</script>

<template>
  <div
    ref="menu"
    class="user-menu"
  >
    <UserMenuTrigger
      :avatar="avatar"
      :name="user?.name"
      :email="user?.email"
      :open="menuOpen"
      @click="toggleMenu"
    />

    <UserMenuDropdown
      v-if="menuOpen"
      :context="context"
      @close="menuOpen = false"
    />
  </div>
</template>

<style lang="scss">
.user-menu {
  position: relative;
}
</style>
