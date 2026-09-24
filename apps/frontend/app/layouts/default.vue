<script setup lang="ts">
import AppSidebar from '~/components/App/Sidebar/components/AppSidebar.vue'
import { useSidebar } from '~/components/App/Sidebar/composables/useSidebar'

const route = useRoute()

const { isCollapsed } = useSidebar()

const hasSidebar = computed(() => !route.meta.withoutSidebar)

useTrackPageSize(useTemplateRef('appPage'))
</script>

<template>
  <div
    class="template-monorepo-app layout"
    :class="{
      '--has-sidebar': hasSidebar,
      '--sidebar-collapsed': isCollapsed,
    }"
  >
    <NuxtRouteAnnouncer />

    <AppSidebar v-if="hasSidebar" />

    <div ref="appPage" class="app-page">
      <AppHeader />

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

.app-page {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;

    > * {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>
