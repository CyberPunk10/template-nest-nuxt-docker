<script setup lang="ts">
import { NuxtLink } from '#components'
import { useSidebar } from '../../composables/useSidebar'
import { resolveIcon } from '../../config/icons'

const props = withDefaults(
  defineProps<{
    chevron?: boolean
    // Рендерить обычный <a> вместо NuxtLink, чтобы переход выполнил браузер,
    // а не Vue Router — тот же смысл, что у одноимённого пропа NuxtLink.
    external?: boolean
    icon?: string
    levelSidebarLink?: number
    newTab?: boolean
    opened?: boolean
    to?: string
    tooltipText?: string
  }>(),
  {
    levelSidebarLink: 1,
  },
)

const emit = defineEmits<{
  'click-section': []
  'toggle-collapse': [value: boolean]
  'set-active': [value: boolean]
}>()

const route = useRoute()

const { isCollapsed } = useSidebar()

const linkComponent = computed(() => {
  if (props.to && props.external) return 'a'
  if (!props.to) return 'button'
  return NuxtLink
})

const linkAttrs = computed(() => {
  const attrs: Record<string, string> = {}

  if (linkComponent.value === 'a') {
    attrs.href = props.to
  }

  if (linkComponent.value === NuxtLink) {
    attrs.to = props.to
  }

  if (props.newTab) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }

  return attrs
})

const isActive = computed(() => {
  const isSamePath = route.path === props.to
  return isSamePath
})

watch(
  () => isActive.value,
  val => emit('set-active', val),
)

onMounted(() => {
  if (isActive.value) {
    emit('set-active', isActive.value)
  }
})

function toggleCollapse() {
  if (props.external) return
  emit('toggle-collapse', !props.opened)
}

function handlerSidebarLink() {
  toggleCollapse()

  if (!props.external) {
    emit('click-section')
  }
}
</script>

<template>
  <div class="sidebar-link__component">
    <component
      :is="linkComponent"
      v-tippy="isCollapsed && levelSidebarLink === 1 && tooltipText ? tooltipText : ''"
      class="sidebar-link"
      :class="{
        '--active': isActive,
        '--collapsed': levelSidebarLink === 1 && isCollapsed,
        '--opened': opened,
      }"
      v-bind="linkAttrs"
      @click="handlerSidebarLink"
    >
      <Icon
        v-if="icon"
        :name="resolveIcon(icon)"
        class="sidebar-link__icon"
      />

      <span
        class="sidebar-link__text"
        :class="{ '--no-icon': !icon }"
      >
        <slot />
      </span>

      <span
        v-if="chevron"
        v-show="levelSidebarLink > 1 || !isCollapsed"
        class="sidebar-link__chevron"
      >
        <slot name="chevron">
          <Icon name="lucide:chevron-right" />
        </slot>
      </span>
    </component>
  </div>
</template>

<style lang="scss">
.sidebar-link {
  position: relative;
  width: 100%;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  border-radius: var(--radius-md);
  padding: 0 var(--space-2-5);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  text-decoration: none;
  text-align: left;
  transition:
    background-color 0.1s,
    color 0.1s;

  &.--opened {
    background-color: var(--control-hover);
    color: var(--text-primary);
  }

  &.--active {
    background-color: var(--accent-subtle);
    color: var(--accent);
  }

  &.--collapsed {
    .sidebar-link {
      &__text {
        opacity: 0;
      }
      &__chevron {
        opacity: 0;
        transition:
          transform 0.2s ease-in-out,
          opacity var(--duration-fast) var(--ease-default);
      }
    }
  }

  &__component {
    margin: 0 0 var(--space-1);
    padding: 0 var(--space-2);
    width: 100%;
    color: var(--control-primary-color);
  }

  &__icon {
    flex: 0 0 1rem;
    width: 1rem;
    height: 1rem;
    color: currentColor;

    svg {
      width: 1rem;
      height: 1rem;
    }
  }

  &__text {
    flex: 1 1 0;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 0.5rem;
    transition: opacity var(--app-sidebar-transition);
  }

  &__chevron,
  &__checkmark {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__chevron {
    color: var(--text-muted);
    width: 1rem;
    height: 1rem;
    order: 3;
    opacity: 1;
    transition:
      transform 0.2s ease-in-out,
      opacity var(--duration-slow) var(--ease-default) var(--duration-normal);

    svg {
      width: 0.75rem;
      height: 0.75rem;
    }

    .app-badge {
      cursor: pointer;
      padding: 0.125rem 0.375rem;
      height: 1.25rem;
      margin-right: var(--space-5);
    }
  }

  &__tooltip {
    &.--hidden {
      display: none;
    }
  }

  &__chevron {
    .app-badge {
      background-color: var(--surface-card);
      color: var(--text-secondary);
    }
  }

  .sidebar-link__chevron {
    transition: transform var(--duration-normal) var(--ease-default);
  }

  &.--opened {
    .sidebar-link__chevron {
      transform: rotate(90deg);
    }
  }

  &:hover {
    background-color: var(--control-hover);
    color: var(--text-primary);
  }
}
</style>
