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
    // внутри этого раздела лежит активный маршрут — подсвечиваем сам раздел,
    // иначе в свёрнутом виде не видно, где находишься
    hasActiveInside?: boolean
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

const linkComponent = computed(() => (props.to ? NuxtLink : 'button'))

const linkAttrs = computed(() => ({
  to: props.to,
  external: props.external,
  target: props.newTab ? '_blank' : undefined,
}))

const isActive = computed(() => route.path === props.to)

watch(isActive, val => emit('set-active', val), { immediate: true })

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
        '--active': isActive || (hasActiveInside && !opened),
        '--opened': opened || hasActiveInside,
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
  font-size: var(--text-sm);
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

  &__chevron {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    width: 1rem;
    height: 1rem;
    order: 3;
    opacity: 1;
    transition:
      transform var(--duration-normal) var(--ease-default),
      /* РАЗВОРАЧИВАНИЕ: появляемся с задержкой, когда панель уже поехала.
         Сворачивание описано в правиле .app-sidebar.--collapsed */
      opacity var(--duration-normal) var(--ease-default) var(--duration-fast);

    svg {
      width: 0.75rem;
      height: 0.75rem;
    }
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
