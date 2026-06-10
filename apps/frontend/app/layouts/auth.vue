<template>
  <div class="layout-auth">
    <NuxtRouteAnnouncer />
    <slot />
  </div>
</template>

<style scoped>
.layout-auth {
  min-height: 100vh;
  background: #080f1a;
  font-family: system-ui, sans-serif;
}
</style>
