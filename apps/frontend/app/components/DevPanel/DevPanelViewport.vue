<script setup lang="ts">
import { useMounted, useWindowSize } from '@vueuse/core'
import { APP_BREAKPOINTS } from '~/composables/useAppBreakpoints'

const { width, height } = useWindowSize()
const { isMobile, isTablet, isDesktop } = useAppBreakpoints()
const { pageWidth, pageHeight } = usePageSize()

const isMounted = useMounted()

type PxEntry = { type: 'px', key: string, value: Ref<number | null> }
type BoolEntry = { type: 'bool', key: string, value: Ref<boolean>, hint: string }
type Entry = PxEntry | BoolEntry
type Section = { source: string, pkg: string, entries: Entry[] }

const sections: Section[] = [
  {
    source: 'useWindowSize()',
    pkg: '@vueuse/core',
    entries: [
      { type: 'px', key: 'width', value: width },
      { type: 'px', key: 'height', value: height },
    ],
  },
  {
    source: 'usePageSize()',
    pkg: '~/composables (size of .app-page)',
    entries: [
      { type: 'px', key: 'pageWidth', value: pageWidth },
      { type: 'px', key: 'pageHeight', value: pageHeight },
    ],
  },
  {
    source: 'useAppBreakpoints()',
    pkg: '~/composables',
    entries: [
      { type: 'bool', key: 'isMobile', value: isMobile, hint: `≤${APP_BREAKPOINTS.mobile}px` },
      { type: 'bool', key: 'isTablet', value: isTablet, hint: `≤${APP_BREAKPOINTS.tablet}px` },
      { type: 'bool', key: 'isDesktop', value: isDesktop, hint: `>${APP_BREAKPOINTS.tablet}px` },
    ],
  },
]

function formatPx(entry: PxEntry): string {
  if (!isMounted.value) return '—'
  return entry.value.value != null ? `${entry.value.value}px` : '—'
}
</script>

<template>
  <div class="vp-table">
    <template v-for="section in sections" :key="section.source">
      <div class="vp-source">
        {{ section.source }} <span>{{ section.pkg }}</span>
      </div>
      <template v-for="entry in section.entries" :key="entry.key">
        <div class="vp-entry">
          <span class="vp-entry__key">{{ entry.key }}</span>
          <template v-if="entry.type === 'px'">
            <code class="vp-entry__val">{{ formatPx(entry) }}</code>
          </template>
          <template v-else>
            <code
              class="vp-entry__val"
              :class="
                isMounted ? (entry.value.value ? 'vp-entry__val--on' : 'vp-entry__val--off') : ''
              "
            >
              {{ isMounted ? entry.value.value : '—' }}
            </code>
            <span class="vp-entry__hint">{{ entry.hint }}</span>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.vp-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vp-source {
  font-family: monospace;
  font-size: 11px;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 2px;

  &:first-child {
    margin-top: 0;
  }

  span {
    font-size: 10px;
    color: #334155;
    margin-left: 5px;
  }
}

.vp-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 8px;

  &__key {
    font-family: monospace;
    font-size: 11px;
    color: var(--text-muted);
    width: 80px;
    flex-shrink: 0;
  }

  &__val {
    font-family: monospace;
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--border-subtle);
    color: #94a3b8;

    &--on {
      background: #1c3a2a;
      color: var(--accent);
    }

    &--off {
      background: var(--border-subtle);
      color: var(--text-muted);
    }
  }

  &__hint {
    font-family: monospace;
    font-size: 10px;
    color: #334155;
  }
}
</style>
