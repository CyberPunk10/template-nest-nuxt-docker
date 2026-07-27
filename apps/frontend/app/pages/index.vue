<script setup lang="ts">
definePageMeta({ title: 'nav.home' })
</script>

<template>
  <div class="home-page">
    <NuxtWelcome class="nuxt-welcome-component" />
  </div>
</template>

<style lang="scss">
@use '~/assets/css/nuxt-welcome';

.home-page {
  display: flex;
  flex: 1;
  min-height: 0;

  .nuxt-welcome-component {
    min-height: auto !important;
    height: 100%;
    flex: 1;
    background-color: transparent !important;
  }
}
</style>
