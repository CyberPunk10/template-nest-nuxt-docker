<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useSidebar } from '../../composables/useSidebar'
import SidebarLink from './SidebarLink.vue'
import AppCollapseTransition from '~/components/App/CollapseTransition.vue'
import type { SidebarMenuItem } from '../../config/sidebar-menu'

const props = withDefaults(
  defineProps<{
    notCollapsedItems: Record<string, boolean>
    item: SidebarMenuItem
    level?: number
    forcePopup?: boolean
  }>(),
  { level: 1 },
)

const emit = defineEmits<{
  'toggle-collapse': [payload: { id: string, value: boolean }]
  'click-section': [item: SidebarMenuItem]
  'click-outside-submenu': [item: SidebarMenuItem]
}>()

const SubMenu = defineAsyncComponent(() => import('./SubMenu.vue'))

const { isCollapsed } = useSidebar()

const show = computed(() => !!props.notCollapsedItems[props.item.id!])
const isPopup = computed(() => (props.forcePopup || isCollapsed.value) && props.level === 1)

function onToggleCollapse(item: SidebarMenuItem, value: boolean) {
  if (!props.notCollapsedItems[props.item.id!] && value && !isCollapsed.value) {
    emit('toggle-collapse', { id: props.item.id!, value: true })
  }

  if (!item.id || !item.items) return
  emit('toggle-collapse', { id: item.id, value })
}

function onClickSection(item: SidebarMenuItem) {
  if (item?.items) return
  emit('click-section', item)
}

const onClickOutsideRef = ref<HTMLElement | null>(null)

onClickOutside(onClickOutsideRef, onClickOutsideSubMenu)

function onClickOutsideSubMenu() {
  // если меню не открыто, то сразу выходим
  if (!props.notCollapsedItems[props.item.id!]) return
  emit('click-outside-submenu', props.item)
}

function getSubItemKey(item: SidebarMenuItem, subitem: SidebarMenuItem, index: number) {
  if (subitem.spacer) return `app-spacer-${item.id}-${index}`
  if (subitem.items) return `submenu_${subitem.id}_${index}`
  return `subitem_${item.id}_${index}`
}
</script>

<template>
  <component :is="isPopup ? 'div' : AppCollapseTransition" ref="onClickOutsideRef">
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
            v-if="subitem.spacer"
          />

          <SidebarLink
            v-else
            :class="subitem.classes"
            :chevron="!!subitem.items"
            :external="subitem.external"
            :newTab="subitem.newTab"
            :icon="subitem.icon"
            :levelSidebarLink="level + 1"
            :opened="notCollapsedItems[subitem.id!]"
            :to="subitem.url"
            @click-section="onClickSection(subitem)"
            @set-active="onToggleCollapse(subitem, $event)"
            @toggle-collapse="onToggleCollapse(subitem, !notCollapsedItems[subitem.id!])"
          >
            {{ $te(subitem.title) ? $t(subitem.title) : subitem.title }}
          </SidebarLink>

          <SubMenu
            v-if="subitem.items"
            :item="subitem"
            :level="level + 1"
            :to="subitem.url"
            :notCollapsedItems="notCollapsedItems"
            @click-section="onClickSection"
            @toggle-collapse="onToggleCollapse(subitem, !notCollapsedItems[subitem.id!])"
            @click-outside-submenu="$emit('click-outside-submenu', $event)"
          />
        </template>

        <slot />
      </div>
    </div>
  </component>
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
          font-size: var(--text-xs);
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
