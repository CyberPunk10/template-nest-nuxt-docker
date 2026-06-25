<script>
import { onClickOutside } from '@vueuse/core'
import SidebarLink from '~/components/App/Sidebar/components/core/SidebarLink.vue'
import AppCollapseTransition from '~/components/App/CollapseTransition.vue'

export default {
  name: 'SubMenu',
  components: {
    SubMenu: defineAsyncComponent(
      () => import('~/components/App/Sidebar/components/core/SubMenu.vue'),
    ),
    SidebarLink,
  },
  props: {
    notCollapsedItems: Object,
    item: Object,
    level: {
      type: Number,
      default: () => 1,
    },
    forcePopup: Boolean,
  },
  emits: ['toggle-collapse', 'click-section', 'click-outside-submenu'],
  setup(props, { emit }) {
    const { isCollapsed } = useSidebar()

    const show = computed(() => !!props.notCollapsedItems[props.item?.id])
    const isPopup = computed(() => (props.forcePopup || isCollapsed.value) && props.level === 1)

    function onToggleCollapse(item, value) {
      if (!props.notCollapsedItems[props.item.id] && value && !isCollapsed.value) {
        emit('toggle-collapse', { id: props.item.id, value: true })
      }

      if (!item.id || !item.items) return
      emit('toggle-collapse', { id: item.id, value })
    }

    function onClickSection(item) {
      if (item?.items) return
      emit('click-section', item)
    }

    const onClickOutsideRef = ref(null)

    onClickOutside(onClickOutsideRef, onClickOutsideSubMenu)

    function onClickOutsideSubMenu() {
      // если меню не открыто, то сразу выходим
      if (!props.notCollapsedItems[props.item.id]) return
      emit('click-outside-submenu', props.item)
    }

    return {
      // refs
      onClickOutsideRef,

      AppCollapseTransition,
      isPopup,
      onClickOutsideSubMenu,
      onClickSection,
      onToggleCollapse,
      show,
    }
  },
}
</script>

<template>
  <component :is="isPopup ? 'div' : AppCollapseTransition" ref="onClickOutsideRef">
    <div
      v-show="isPopup || show"
      class="aside-dropdown"
      :class="[
        `--aside-item-id--${item.id}`,
        {
          '--popup': isPopup,
          '--show-sub-menu': show,
        },
      ]"
      data-test-id="dropdown"
    >
      <div v-if="isPopup" class="aside-dropdown__header">
        {{ $t(item.title) }}
      </div>

      <div class="aside-dropdown__scroll --custom-css-scrollbar" :class="`--level-${level}`">
        <template v-for="(subitem, index) in item.items">
          <app-spacer
            v-if="subitem.spacer"
            :key="`app-spacer-${item.id}-${index}`"
            :data-test-id="`app-spacer-${item.id}`"
          />

          <SidebarLink
            v-else
            :key="`subitem_${item.id}_${index}`"
            :class="subitem.classes"
            :chevron="!!subitem.items"
            :external="subitem.external"
            :icon="subitem.icon"
            :levelAsideLink="level + 1"
            :opened="notCollapsedItems[subitem.id]"
            :params="subitem.params"
            :ignoreParams="subitem.ignoreParams"
            :to="subitem.url"
            data-test-id="link"
            @click-section="onClickSection(subitem)"
            @set-active="onToggleCollapse(subitem, $event)"
            @toggle-collapse="onToggleCollapse(subitem, !notCollapsedItems[subitem.id])"
          >
            {{ $te(subitem.title) ? $t(subitem.title) : subitem.title }}
          </SidebarLink>

          <SubMenu
            v-if="subitem.items"
            :key="`submenu_${subitem.id}_${index}`"
            :item="subitem"
            :level="level + 1"
            :to="subitem.url"
            :notCollapsedItems="notCollapsedItems"
            data-test-id="inner-dropdown"
            @click-section="onClickSection"
            @toggle-collapse="onToggleCollapse(subitem, !notCollapsedItems[subitem.id])"
            @click-outside-submenu="$emit('click-outside-submenu', $event)"
          />
        </template>

        <slot />
      </div>
    </div>
  </component>
</template>

<style lang="scss">
.aside-dropdown {
  &__header {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    border-bottom: 1px solid var(--control-primary-minor-color);
    padding: var(--space-2) var(--space-4);
    margin-bottom: var(--space-1);
  }

  .aside-link {
    height: var(--aside-item-height-sm);

    &.--opened {
      background-color: var(--control-primary-minor-color);
    }

    &.--active {
      background-color: var(--active-bg-color);
      color: var(--active-text-color);
    }
  }

  .aside-dropdown__scroll {
    .aside-link__component {
      .aside-link {
        height: var(--aside-item-height-xs);
      }
    }

    &.--level-1 {
      .aside-link__component {
        padding-left: var(--space-6);
      }
    }

    &.--level-2 {
      .aside-link__component {
        padding-left: var(--space-12);

        .aside-link {
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
    background: var(--background);
    border-radius: var(--radius-lg);
    border: 1px solid var(--control-primary-minor-color);
    box-shadow: var(--shadow-popup);
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

    &.--aside-item-id--users,
    &.--aside-item-id--big-section {
      min-width: 12.5rem;
    }

    .aside-dropdown__scroll {
      overflow: auto;

      .aside-link__component {
        padding-left: var(--space-1);
        padding-right: var(--space-1);
      }

      &.--level-1 {
        max-height: var(--aside-dropdown-max-height);
      }

      &.--level-2 {
        .aside-link__component {
          padding-left: var(--space-4);
        }
      }
    }

    .aside-link {
      min-height: var(--aside-item-height-sm);
      height: auto;
      padding: var(--space-2) var(--space-3);

      &__text {
        white-space: normal;
      }
    }
  }
}

// делаем кастомный скролл ещё тоньше, special for .aside-dropdown__scroll
.layout-scrollbar-obtrusive {
  .aside-dropdown__scroll.--custom-css-scrollbar::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }
}
.aside-dropdown__scroll {
  &.--custom-css-scrollbar {
    &::-webkit-scrollbar-thumb {
      border: 1px solid var(--scrollbar-color-border);
    }
  }
}
</style>
