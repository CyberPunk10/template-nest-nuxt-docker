<script setup lang="ts">
import AppSidebar from '~/components/App/Sidebar/components/AppSidebar.vue'

const route = useRoute()
const isShowAppHeader = computed(() => !route.meta.hideHeader)
const isShowAppSidebar = computed(() => !route.meta.hideSidebar)
const { isCollapsed } = useSidebar()
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

    <div class="app-page" :class="{ '--has-app-header': isShowAppHeader }">
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
