<script setup lang="ts">
const { user } = useAuth()
const route = useRoute()
</script>

<template>
  <div class="layout">
    <NuxtRouteAnnouncer />
    <AppHeader v-if="user && !route.meta.hideHeader" />
    <div class="layout__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  transition: padding-right 0.3s ease;
}

.layout--dev-open {
  padding-right: 360px;
}

.layout__content {
  height: 100%;
}
</style>
