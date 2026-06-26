<script setup lang="ts">
import { NuxtLink } from '#components'
import { useSidebar } from '../../composables/useSidebar'
import { themeSwither } from '../../config/sidebar-menu'

const ICON_MAP: Record<string, string> = {
  home: 'lucide:house',
  help: 'lucide:circle-help',
  out: 'lucide:log-out',
  'no-photo-avatar': 'lucide:user-round',
  close: 'lucide:x',
  'light-theme': 'lucide:sun',
  'dark-theme': 'lucide:moon',
  'system-theme': 'lucide:monitor',
  'dark-green-theme': 'lucide:leaf',
  'dark-midnight-theme': 'lucide:github',
  'dark-ocean-theme': 'lucide:waves',
  chevron: 'lucide:chevron-right',
  'chevron-back': 'lucide:chevron-left',
  checkmark: 'lucide:check',
}

function resolveIcon(type: string): string {
  if (ICON_MAP[type]) return ICON_MAP[type]
  if (type.includes(':')) return type
  return `lucide:${type}`
}

const props = withDefaults(
  defineProps<{
    chevron?: boolean
    external?: boolean
    icon?: string
    levelSidebarLink?: number
    opened?: boolean
    params?: Record<string, string>
    to?: string
    tooltipText?: string
    ignoreParams?: boolean
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

const $route = useRoute()
const colorMode = useColorMode()
const { $globalEvents } = useNuxtApp()
const { isCollapsed } = useSidebar()

const excludedParams = [
  'metrics',
  'sort',
  'order',
  'learning',
  'period',
  'page',
  'force',
  'groupBy',
]

const url = computed(() => {
  const params = Object.entries(props.params || {}).map(data => data.join('='))
  return `${props.to || ''}${props.params ? '?' : ''}${params.join('&')}`
})

const linkComponent = computed(() => {
  if (props.to && props.external) return 'a'
  if (!props.to) return 'button'
  return NuxtLink
})

const linkAttrs = computed(() => {
  const attrs: Record<string, string> = {}

  if (linkComponent.value === 'a') {
    attrs.href = url.value
  }

  if (linkComponent.value === NuxtLink) {
    attrs.to = url.value
  }

  if (props.external) {
    attrs.target = '_blank'
  }

  return attrs
})

const isActive = computed(() => {
  const { query } = $route
  const notExcluded = (key: string) => !excludedParams.includes(key)
  const withoutExcluded = Object.keys(query).filter(notExcluded)

  const isSamePath = $route.path === props.to

  if (props.params) {
    const checkParam = ([key, value]: [string, string]) => {
      // таблицы с конструкторами отчетов
      // проверяем параметр checked перебором
      if (key === 'checked' && $route.query.checked) {
        // убираем из выборки столбцы с датой и автоматические колонки
        // для избранных отчетов
        const autoColumns = ['dm_offer_currency', 'dm_offer_status']
        const excludeCol = (col: string) =>
          !/^dm_lead_date.*/.test(col) && !autoColumns.includes(col)

        const arChecked = value.split(',').filter(excludeCol)
        const routeChecked = ($route.query.checked as string).split(',').filter(excludeCol)
        const notInRoute = arChecked.filter(col => !routeChecked.includes(col))
        const notChecked = routeChecked.filter(col => !arChecked.includes(col))

        return !notInRoute.length && !notChecked.length
      }

      return $route.query[key] === value.toString()
    }
    const linkHasAllParams = Object.entries(props.params)
      .filter(([key]) => !excludedParams.includes(key))
      .every(checkParam)

    // если в двух одинаковых отчетах в одном есть валюта, а в другом нет
    // и выбран отчет с валютой, не выделять отчет без валюты
    if (
      linkHasAllParams
      && withoutExcluded.includes('stats_currency')
      && !props.params.stats_currency
    ) {
      return false
    }

    const linkParamsKeys = Object.keys(props.params).filter(key => !excludedParams.includes(key))
    const isSameParams = withoutExcluded.every(queryKey => linkParamsKeys.includes(queryKey))

    return linkHasAllParams && isSamePath && isSameParams
  }

  return isSamePath && (!withoutExcluded.length || props.ignoreParams)
})

const showCheckmark = computed(() => {
  if (!props.icon) return false
  if (props.levelSidebarLink === 1) return false
  const themeSwitherItem = themeSwither.items.find(i => i.icon === props.icon)
  if (!themeSwitherItem) return false
  return themeSwitherItem.id === colorMode.preference
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

  if (linkComponent.value === NuxtLink) {
    $globalEvents.emit('sidebar-click-link', {
      url: props.to,
      query: { ...props.params },
    })
  }
}
</script>

<template>
  <div class="aside-link__component">
    <component
      :is="linkComponent"
      class="aside-link"
      :class="{
        '--active': isActive,
        '--collapsed': levelSidebarLink === 1 && isCollapsed,
        '--opened': opened,
      }"
      v-bind="linkAttrs"
      data-test-id="link-component"
      @click="handlerSidebarLink"
    >
      <Icon v-if="icon" :name="resolveIcon(icon)" class="aside-link__icon" />

      <span class="aside-link__text" :class="{ '--no-icon': !icon }" data-test-id="text">
        <slot />
      </span>

      <span
        v-if="chevron"
        v-show="levelSidebarLink > 1 || !isCollapsed"
        class="aside-link__chevron"
        data-test-id="chevron"
      >
        <slot name="chevron">
          <Icon name="lucide:chevron-right" />
        </slot>
      </span>

      <span v-if="showCheckmark" class="aside-link__checkmark">
        <Icon name="lucide:check" />
      </span>
    </component>
  </div>
</template>

<style lang="scss">
.aside-link {
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
  color: var(--text-secondary-color);
  font-size: 0.8125rem;
  text-decoration: none;
  text-align: left;
  transition:
    background-color 0.1s,
    color 0.1s;

  &.--opened {
    background-color: var(--control-primary-minor-color);
    color: var(--text-primary-color);
  }

  &.--active {
    background-color: var(--active-bg-color);
    color: var(--active-text-color);
  }

  &.--collapsed {
    .aside-link {
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
    color: var(--text-tertiary-color);
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
      background-color: var(--background-secondary);
      color: var(--text-secondary-color);
    }
  }

  .aside-link__chevron {
    transition: transform var(--duration-normal) var(--ease-default);
  }

  &.--opened {
    .aside-link__chevron {
      transform: rotate(90deg);
    }
  }

  &:hover {
    background-color: var(--control-primary-minor-color);
    color: var(--text-primary-color);
  }
}
</style>
