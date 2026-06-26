<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import AppSidebar from '~/components/App/Sidebar/components/AppSidebar.vue'
import { useSidebar } from '~/components/App/Sidebar/composables/useSidebar'

const route = useRoute()
const isShowAppHeader = computed(() => !route.meta.hideHeader)
const isShowAppSidebar = computed(() => !route.meta.hideSidebar)
const { isCollapsed } = useSidebar()

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
  <div
    class="template-monorepo-app layout"
    :class="{
      '--has-sidebar': isShowAppSidebar,
      '--sidebar-collapsed': isCollapsed,
    }"
  >
    <NuxtRouteAnnouncer />

    <ClientOnly>
      <AppSidebar v-if="isShowAppSidebar" />
    </ClientOnly>

    <div
      ref="pageRef"
      class="app-page"
      :class="{ '--has-app-header': isShowAppHeader }"
    >
      <AppHeader v-if="isShowAppHeader" />

      <div class="app-page__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
.layout {
  font-family: system-ui, sans-serif;
  transition: margin var(--app-sidebar-transition);

  .app-page.--has-app-header {
    .app-page__content {
      height: calc(100vh - 52px);

      & > div {
        height: 100%;
      }
    }
  }

  &.--has-sidebar {
    margin-left: var(--app-sidebar-width);
  }

  &.--has-sidebar.--sidebar-collapsed {
    margin-left: var(--app-sidebar-width-mini);
  }
}
</style>
