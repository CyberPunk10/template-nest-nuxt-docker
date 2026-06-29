<script setup lang="ts">
import { useFloating, offset, flip, shift, arrow, autoUpdate } from '@floating-ui/vue'

interface Props {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  delay: 100,
})

const reference = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)
const open = ref(false)
let openTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const { floatingStyles, middlewareData, placement: currentPlacement } = useFloating(reference, floatingEl, {
  open,
  placement: props.placement,
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
})

const arrowSide = computed(() => ({
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}[currentPlacement.value.split('-')[0]] as string))

const arrowStyle = computed(() => {
  const { x, y } = middlewareData.value.arrow ?? {}
  return {
    left: x != null ? `${x}px` : '',
    top: y != null ? `${y}px` : '',
    [arrowSide.value]: '-4px',
  }
})

function show() {
  if (closeTimer) clearTimeout(closeTimer)
  openTimer = setTimeout(() => {
    open.value = true
  }, props.delay)
}

function hide() {
  if (openTimer) clearTimeout(openTimer)
  closeTimer = setTimeout(() => {
    open.value = false
  }, 100)
}
</script>

<template>
  <div
    ref="reference"
    class="app-tooltip-trigger"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="app-tooltip">
      <div
        v-if="open && content"
        ref="floatingEl"
        class="app-tooltip"
        role="tooltip"
        :style="floatingStyles"
        @mouseenter="show"
        @mouseleave="hide"
      >
        {{ content }}
        <div
          ref="arrowRef"
          class="app-tooltip__arrow"
          :style="arrowStyle"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.app-tooltip-trigger {
  display: contents;
}

.app-tooltip {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  max-width: 240px;
  padding: 6px 10px;
  background: var(--background-secondary);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-popup);
  font-size: var(--text-xs);
  line-height: 1.4;
  color: var(--text-primary-color);
  white-space: nowrap;
  pointer-events: none;

  &__arrow {
    position: absolute;
    width: var(--space-2);
    height: var(--space-2);
    background: var(--background-secondary);
    border: 1px solid var(--divider-color);
    transform: rotate(45deg);
    pointer-events: none;
  }
}

.app-tooltip-enter-active,
.app-tooltip-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.app-tooltip-enter-from,
.app-tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
