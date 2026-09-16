<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useSidebar } from '../composables/useSidebar'
import { useMenu } from '../composables/useMenu'
import { isSection, isSpacer, type SidebarMenuItem } from '../config/sidebar-menu'
import SidebarLink from './core/SidebarLink.vue'
import UserMenu from '~/components/App/UserMenu/index.vue'
import SidebarLogo from './SidebarLogo.vue'
import SidebarShadow from './core/SidebarShadow.vue'
import SubMenu from './core/SubMenu.vue'

const {
  collapseAllSections,
  expandedSections,
  isDrawerMode,
  isDrawerOpen,
  isCollapsed,
  setSectionExpanded,
  toggleCollapsed,
  toggleDrawer,
} = useSidebar()

const { isLocked: isScrollLocked } = useBodyScrollLock()

const onClickOutsideRef = useTemplateRef('sidebarWrapper')

const scrollShadowRef = useTemplateRef('scrollShadow')

const { sidebarMenu } = useMenu()

const { t } = useI18n()

const collapseTooltip = computed(() => (isCollapsed.value ? t('sidebar.expand') : t('sidebar.collapse')))

// при переключении layout компонент монтируется заново — закрываем drawer,
// иначе он останется открытым от предыдущего layout
onMounted(() => toggleDrawer(false))

// вне drawer сайдбар не перекрывает контент — блокировать скролл незачем
watchEffect(() => {
  isScrollLocked.value = isDrawerOpen.value && isDrawerMode.value
})

function onToggleCollapse({ id, value = false }: { id: string, value?: boolean }) {
  if (!id) return
  setSectionExpanded(id, value)
  scrollShadowRef.value?.refreshShadows()
}

// Плоский индекс меню: по id сразу известно, раскрываемый ли это раздел и чей он
// вложенный. Пересчитывается при смене меню, а не обходом дерева на каждый клик.
const menuIndex = computed(() => {
  const index = new Map<string, { hasItems: boolean, parentId?: string }>()

  const walk = (items: SidebarMenuItem[], parentId?: string) => {
    for (const item of items) {
      const nested = 'items' in item ? item.items : undefined
      if (item.id) index.set(item.id, { hasItems: !!nested?.length, parentId })
      if (nested?.length) walk(nested, item.id)
    }
  }

  walk(sidebarMenu.value)
  return index
})

// Разделы, внутри которых лежит текущий маршрут: подсвечиваем их, иначе в свёрнутом
// разделе не видно, где находишься. Дети внешнего раздела тоже попадают в набор,
// поэтому подсвечивается вся цепочка предков активного пункта.
const route = useRoute()

const sectionsWithActive = computed(() => {
  const ids = new Set<string>()

  const walk = (items: SidebarMenuItem[]): boolean => {
    let hasActive = false

    for (const item of items) {
      const nested = 'items' in item ? item.items : undefined
      const isActiveLink = 'url' in item && !item.external && item.url === route.path
      const activeInside = nested?.length ? walk(nested) : false

      if (activeInside && item.id) ids.add(item.id)
      if (isActiveLink || activeInside) hasActive = true
    }

    return hasActive
  }

  walk(sidebarMenu.value)
  return ids
})

function onClickSection({ id, value }: { id: string, value?: boolean }) {
  const section = menuIndex.value.get(id)

  if (!section?.hasItems) {
    toggleDrawer(false)
    if (isCollapsed.value) collapseAllSections()
    return
  }

  const resultValue = typeof value === 'boolean' ? value : !expandedSections.value[id]
  collapseAllSections()

  // если меню вложенное, сначала раскрыть родительское
  if (section.parentId) onToggleCollapse({ id: section.parentId, value: true })
  onToggleCollapse({ id, value: resultValue })
}

onClickOutside(onClickOutsideRef, onClickOutsideSidebar)

function onClickOutsideSidebar() {
  requestAnimationFrame(() => {
    if (!isCollapsed.value) return
    collapseAllSections()
  })
}

function clickByShadow() {
  toggleDrawer(false)
}

onKeyStroke('Escape', () => {
  if (!isDrawerOpen.value || !isDrawerMode.value) return
  toggleDrawer(false)
})

// Cmd/Ctrl+B — for toggle sidebar width or drawer open/close. If focus is in input, ignore.
onKeyStroke('b', (e) => {
  if (!e.metaKey && !e.ctrlKey) return

  const el = document.activeElement
  const isTyping = el instanceof HTMLElement
    && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
  if (isTyping) return

  e.preventDefault()
  if (isDrawerMode.value) toggleDrawer()
  else toggleSideBarWidth()
})

function toggleSideBarWidth() {
  collapseAllSections()
  toggleCollapsed()
}
</script>

<template>
  <div
    ref="sidebarWrapper"
    class="app-sidebar__wrapper"
    :class="{
      '--drawer-open': isDrawerOpen,
      '--collapsed': isCollapsed,
    }"
  >
    <SidebarShadow @click="clickByShadow" />

    <nav
      class="app-sidebar"
      :class="{ '--collapsed': isCollapsed }"
      :aria-label="$t('sidebar.label')"
    >
      <SidebarLogo />

      <app-scroll-shadow
        ref="scrollShadow"
        class="sidebar-menu"
        withoutIgnoreSwipe
      >
        <!-- Items menu -->
        <template v-for="(item, index) in sidebarMenu" :key="`sidebar-item-${index}`">
          <app-spacer v-if="isSpacer(item)" :data-spacer-id="item.id" />

          <div v-else class="sidebar-menu__item">
            <SidebarLink
              :to="item.url"
              :external="item.external"
              :newTab="item.newTab"
              :class="item.classes"
              :opened="expandedSections[item.id]"
              :hasActiveInside="sectionsWithActive.has(item.id)"
              :tooltipText="$t(item.title)"
              :icon="item.icon"
              :chevron="!!item.items"
              @click-section="onClickSection({ id: item.id })"
            >
              {{ $t(item.title) }}
            </SidebarLink>

            <SubMenu
              v-if="isSection(item)"
              :item="item"
              :sectionsWithActive="sectionsWithActive"
              @toggle-collapse="onToggleCollapse"
              @click-section="onClickSection({ id: $event.id })"
            />
          </div>
        </template>
      </app-scroll-shadow>

      <div class="sidebar-collapse">
        <SidebarLink
          :icon="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
          :tooltipText="collapseTooltip"
          @click-section="toggleSideBarWidth"
        >
          {{ t('sidebar.collapseShort') }}
        </SidebarLink>
      </div>

      <div class="sidebar-footer">
        <UserMenu />
      </div>
    </nav>
  </div>
</template>

<style lang="scss">
.app-sidebar__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: var(--z-overlay);
  user-select: none;
}

.app-sidebar {
  z-index: var(--z-raised);
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-panel);
  font-size: var(--text-xs);
  transition: width var(--app-sidebar-transition);

  .sidebar-collapse {
    margin-top: auto;
    padding: var(--space-1) 0 var(--space-0-5);

    .sidebar-link:not(:hover) {
      color: var(--text-muted);
    }

    .sidebar-link__icon {
      flex-basis: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
      margin-left: -1px;
    }

    @include media-down(lg) {
      display: none;
    }
  }

  .sidebar-footer {
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-1);
    padding-bottom: var(--space-0-5);

    .user-menu {
      padding: var(--space-0-5) var(--space-1-5) var(--space-1);

      &__trigger {
        padding: var(--space-1) var(--space-2) var(--space-1) 3px;

        &:hover {
          border-color: var(--border-subtle);
          background: rgba(255, 255, 255, 0.03);
        }
      }
    }
  }

  &.--collapsed {
    overflow: visible;

    .sidebar-link__text,
    .sidebar-link__chevron,
    .user-menu__info,
    .user-menu__chevron {
      opacity: 0;
    }

    /* transition читается с целевого состояния, поэтому здесь описано
       СВОРАЧИВАНИЕ. Появление — в базовых правилах этих элементов. */
    .sidebar-link__chevron {
      transition: opacity var(--duration-normal) var(--ease-default);
    }

    .sidebar-dropdown {
      .sidebar-link__text,
      .sidebar-link__chevron {
        opacity: 1;
      }
    }

    .logo__text {
      max-width: 0;
      opacity: 0;
      /* СВОРАЧИВАНИЕ: opacity гаснет вместе с остальным содержимым, а
         max-width схлопывается быстрее — иначе текст упирается в сужающуюся
         панель. Разворачивание описано в базовом правиле Logo.vue */
      transition:
        max-width var(--duration-normal) var(--ease-default),
        opacity var(--app-sidebar-transition);
    }

    .sidebar-menu.app-scroll-shadow {
      overflow: visible;
    }

    .sidebar-footer {
      .user-menu {
        &__trigger {
          &:hover {
            border-color: transparent;
            background: transparent;

            .user-menu__avatar {
              outline: 4px solid var(--control-hover);
            }
          }
        }
      }
    }
  }
}

.sidebar-menu {
  &__item {
    position: relative;

    ~ .app-spacer {
      padding-top: var(--space-1);
    }
  }

  &.app-scroll-shadow {
    overflow: hidden auto;
    padding-top: var(--space-2);
    padding-bottom: var(--space-0-5);

    .app-sidebar.--collapsed & {
      overflow: visible;
    }

    .app-sidebar:not(.--collapsed) & {
      display: flex;
      flex-direction: column;
      flex: 1;

      > * {
        flex: 0 0 auto;
      }
    }
  }
}

@include media-down(lg) {
  .sidebar-footer {
    display: none;
  }
}

// делаем кастомный скролл ещё тоньше, special for .sidebar-menu
.layout-scrollbar-obtrusive {
  .sidebar-menu.--custom-css-scrollbar::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
}
.sidebar-menu.--custom-css-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 9px;
  border: 0px;
}

html.light {
  .sidebar-footer.--app-scroll-shadow-bottom {
    border-color: transparent;
  }
}
</style>
