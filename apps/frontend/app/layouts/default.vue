<script setup lang="ts">
import AppSidebar from '~/components/App/Sidebar/components/AppSidebar.vue'
import { useSidebar } from '~/components/App/Sidebar/composables/useSidebar'

const route = useRoute()

const { isCollapsed } = useSidebar()

const hideHeader = computed(() => route.meta.hideHeader)
const hideSidebar = computed(() => route.meta.hideSidebar)

useTrackPageSize(useTemplateRef('appPage'))
</script>

<template>
  <div
    class="template-monorepo-app layout"
    :class="{
      '--has-sidebar': !hideSidebar,
      '--sidebar-collapsed': isCollapsed,
    }"
  >
    <NuxtRouteAnnouncer />

    <AppSidebar v-if="!hideSidebar" />

    <div
      ref="appPage"
      class="app-page"
      :class="{ '--has-app-header': !hideHeader }"
    >
      <AppHeader v-if="!hideHeader" />

      <div class="app-page__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.layout {
  margin-left: 0;
  transition: margin-left var(--app-sidebar-transition);

  &.--has-sidebar {
    margin-left: var(--app-sidebar-width);

    .app-sidebar {
      width: var(--app-sidebar-width);
    }

    &.--sidebar-collapsed {
      margin-left: var(--app-sidebar-width-collapsed);

      .app-sidebar {
        width: var(--app-sidebar-width-collapsed);
      }
    }
  }

  @include media-down(lg) {
    &.--has-sidebar {
      margin-left: 0;

      .app-sidebar {
        margin-left: calc(-1 * var(--app-sidebar-width));
      }

      &.--sidebar-collapsed {
        margin-left: 0;

        .app-sidebar {
          margin-left: calc(-1 * var(--app-sidebar-width-collapsed));
        }
      }

      /* drawer открыт — сайдбар выезжает обратно поверх контента */
      .app-sidebar__wrapper.--drawer-open .app-sidebar {
        margin-left: 0;
      }
    }
  }

  .app-sidebar {
    transition:
      width var(--app-sidebar-transition),
      margin-left var(--app-sidebar-transition);
  }
}

.app-page.--has-app-header {
  .app-page__content {
    height: calc(100vh - var(--app-header-height));

    @include media-up(lg) {
      height: 100vh;
    }

    & > div {
      height: 100%;
    }
  }
}
</style>
