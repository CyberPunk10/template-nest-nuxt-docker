<script setup lang="ts">
import { useSidebar } from '../../composables/useSidebar'
import SidebarLink from './SidebarLink.vue'
import AppCollapseTransition from '~/components/App/CollapseTransition.vue'
import { isSection, isSpacer, type SidebarMenuItem, type SidebarSection } from '../../config/sidebar-menu'

const props = withDefaults(
  defineProps<{
    item: SidebarSection
    level?: number
    sectionsWithActive: Set<string>
  }>(),
  { level: 1 },
)

const emit = defineEmits<{
  'toggle-collapse': [payload: { id: string, value: boolean }]
  'click-section': [item: SidebarMenuItem]
}>()

const SubMenu = defineAsyncComponent(() => import('./SubMenu.vue'))

const { isCollapsed, isSectionExpanded } = useSidebar()

const show = computed(() => isSectionExpanded(props.item.id))
const isPopup = computed(() => isCollapsed.value && props.level === 1)

function onToggleCollapse(item: SidebarMenuItem, value: boolean) {
  if (!isSectionExpanded(props.item.id) && value && !isCollapsed.value) {
    emit('toggle-collapse', { id: props.item.id, value: true })
  }

  if (!isSection(item)) return
  emit('toggle-collapse', { id: item.id, value })
}

function onClickSection(item: SidebarMenuItem) {
  if (isSection(item)) return
  emit('click-section', item)
}

function getSubItemKey(item: SidebarMenuItem, subitem: SidebarMenuItem, index: number) {
  if (isSpacer(subitem)) return `app-spacer-${subitem.id}`
  if (subitem.items) return `submenu_${subitem.id}_${index}`
  return `subitem_${item.id}_${index}`
}
</script>

<template>
  <!-- Подменю рендерится только на клиенте: в popup-режиме (свёрнутый сайдбар) у него
       другая обёртка — div вместо CollapseTransition, иначе транзишн управляет высотой
       всплывающей панели и содержимое схлопывается. Режим зависит от ширины экрана,
       которой сервер не знает, поэтому структуру не согласовать. Сам сайдбар при этом
       рендерится на сервере, а закрытое подменю до гидратации всё равно не видно -->
  <ClientOnly>
    <component :is="isPopup ? 'div' : AppCollapseTransition">
      <div
        v-show="isPopup || show"
        class="sidebar-dropdown"
        :class="[
          `--sidebar-item-id--${item.id}`,
          {
            '--popup': isPopup,
            '--show-sub-menu': show,
          },
        ]"
      >
        <div v-if="isPopup" class="sidebar-dropdown__header">
          {{ $t(item.title) }}
        </div>

        <div class="sidebar-dropdown__scroll --custom-css-scrollbar" :class="`--level-${level}`">
          <template
            v-for="(subitem, index) in item.items"
            :key="getSubItemKey(item, subitem, index)"
          >
            <app-spacer
              v-if="isSpacer(subitem)"
              :data-spacer-id="subitem.id"
            />

            <SidebarLink
              v-else
              :class="subitem.classes"
              :chevron="!!subitem.items"
              :external="subitem.external"
              :newTab="subitem.newTab"
              :icon="subitem.icon"
              :levelSidebarLink="level + 1"
              :opened="isSectionExpanded(subitem.id)"
              :hasActiveInside="sectionsWithActive.has(subitem.id)"
              :to="subitem.url"
              @click-section="onClickSection(subitem)"
              @set-active="onToggleCollapse(subitem, $event)"
              @toggle-collapse="onToggleCollapse(subitem, !isSectionExpanded(subitem.id))"
            >
              {{ $te(subitem.title) ? $t(subitem.title) : subitem.title }}
            </SidebarLink>

            <SubMenu
              v-if="isSection(subitem)"
              :item="subitem"
              :level="level + 1"
              :sectionsWithActive="sectionsWithActive"
              @click-section="onClickSection"
              @toggle-collapse="onToggleCollapse(subitem, !isSectionExpanded(subitem.id))"
            />
          </template>

          <slot />
        </div>
      </div>
    </component>
  </ClientOnly>
</template>

<style lang="scss">
.sidebar-dropdown {
  &__header {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    border-bottom: 1px solid var(--control-hover);
    padding: var(--space-2) var(--space-4);
    margin-bottom: var(--space-1);
  }

  .sidebar-link {
    height: var(--app-sidebar-item-height-sm);
    font-size: .8125rem;

    &.--opened {
      background-color: var(--control-hover);
    }

    &.--active {
      background-color: var(--accent-subtle);
      color: var(--accent);
    }
  }

  .sidebar-dropdown__scroll {
    .sidebar-link__component {
      .sidebar-link {
        height: var(--app-sidebar-item-height-xs);
      }
    }

    &.--level-1 {
      .sidebar-link__component {
        padding-left: var(--space-6);
      }
    }

    &.--level-2 {
      .sidebar-link__component {
        padding-left: var(--space-12);

        .sidebar-link {
          height: auto;
          padding-top: var(--space-1-5);
          padding-bottom: var(--space-1-5);
        }
      }
    }
  }

  &.--popup {
    position: absolute;
    top: 0;
    left: calc(100% + var(--space-1));
    background: var(--surface-popover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--control-hover);
    box-shadow: var(--shadow-md);
    min-width: 11.25rem;
    max-width: 13.75rem;
    width: max-content;
    transform: translateX(-4px);
    transform-origin: top left;
    transition:
      transform var(--duration-normal),
      opacity var(--duration-normal);
    opacity: 0;
    visibility: hidden;

    &.--show-sub-menu {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }

    &.--sidebar-item-id--users,
    &.--sidebar-item-id--big-section {
      min-width: 12.5rem;
    }

    .sidebar-dropdown__scroll {
      overflow: auto;

      .sidebar-link__component {
        padding-left: var(--space-1);
        padding-right: var(--space-1);
      }

      &.--level-1 {
        max-height: var(--app-sidebar-dropdown-max-height);
      }

      &.--level-2 {
        .sidebar-link__component {
          padding-left: var(--space-4);
        }
      }
    }

    .sidebar-link {
      min-height: var(--app-sidebar-item-height-sm);
      height: auto;
      padding: var(--space-2) var(--space-3);

      &__text {
        white-space: normal;
      }
    }
  }
}

// делаем кастомный скролл ещё тоньше, special for .sidebar-dropdown__scroll
.layout-scrollbar-obtrusive {
  .sidebar-dropdown__scroll.--custom-css-scrollbar::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }
}
.sidebar-dropdown__scroll {
  &.--custom-css-scrollbar {
    &::-webkit-scrollbar-thumb {
      border: 1px solid var(--scrollbar-border);
    }
  }
}
</style>
