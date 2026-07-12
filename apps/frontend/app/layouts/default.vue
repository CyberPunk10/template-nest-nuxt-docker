<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

// размер .app-page меняется динамически (AppSidebar collapse/mobile) — синхронизируем в usePageSize()
const pageRef = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(pageRef)
const { pageWidth, pageHeight } = usePageSize()
watch(width, (v) => {
  pageWidth.value = v
})
watch(height, (v) => {
  pageHeight.value = v
})
</script>

<template>
  <div class="layout">
    <NuxtRouteAnnouncer />

    <div
      ref="pageRef"
      class="app-page"
    >
      <AppHeader />

      <div class="app-page__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.layout {
}
</style>
