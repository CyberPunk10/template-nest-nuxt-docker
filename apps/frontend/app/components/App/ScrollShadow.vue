<!--
  1. Добавляет тень при скролле
  2. Тень добавляет к соседним элемантам, но если их нет, то к родителю
  3. Тень добавляется автоматически, но если какая-то тень не нужна, то это можно отключить
     передав например 'ignoreAutoShadowTop' или 'ignoreAutoShadowBottom'
  4. Отдает наружу событие 'update-shadow', когда должна обновляться тень,
     это можно использовать для ручного добавления тени
  5. Отдает наружу событие 'scroll-handler' во время скролла
  6. Добавлены тени для горизонтального скролла, но на данный момент
     не работают совместно с вертикальными (перезатирают друг друга).
     Поэтому если нужны и вертикальные и горизонтальный тени одновременно, то одни из них
     добавлять вручную из события 'update-shadow' и прокидывать для них 'ignoreAutoShadow{Right}'
  7. Чтобы добавить тень в ручную, необходимо прокинуть 'ignoreAutoShadow{Right/Left/Top/Bottom}'
     и подписаться на событие 'update-shadow', которое эмитится, когда происходит обновление тени
     и далее добавлять/убирать класс нужной тени '--app-scroll-shadow-{left} на нужном элементе
     * на нужном элементе уже могут автоматически добавляться другие тени,
       тогда найти другой элемент или обернуть в пустой div например
-->
<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

const props = defineProps<{
  ignoreAutoShadowAll?: boolean
  ignoreAutoShadowTop?: boolean
  ignoreAutoShadowLeft?: boolean
  ignoreAutoShadowRight?: boolean
  ignoreAutoShadowBottom?: boolean
  scrollWithMouseMovements?: boolean // прокрутка с помощью движений мыши (нажать и перемещать)
  triggerScrollHandler?: boolean // обновляя значение будет дергаться метод scrollHandler
  withoutIgnoreSwipe?: boolean // по умолчанию игнорирует события свайпа, этот флаг это отменяет
  hideScrollBars?: boolean // скрыть полосу прокрутки
}>()

const emit = defineEmits<{
  'update-shadow': [payload: ShadowPayload]
  'scroll-handler': [payload: ScrollPayload]
}>()

type ShadowPayload = {
  position: 'top' | 'bottom' | 'left' | 'right'
  process: number
  val: boolean
  scrollTop?: number
  scrollLeft?: number
  type: 'vertical' | 'horizontal'
  isParent?: boolean
}

type ScrollPayload = {
  hasHBar: boolean
  hasVBar: boolean
  type?: 'vertical' | 'horizontal'
  process?: number
  scrollTop?: number
  scrollLeft?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
  { leading = true } = {},
): T {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (leading && now - last >= wait) {
      last = now
      fn.apply(this, args)
    } else {
      if (timer) clearTimeout(timer)
      timer = setTimeout(
        () => {
          last = Date.now()
          fn.apply(this, args)
        },
        wait - (now - last),
      )
    }
  } as T
}

const appScrollShadowRef = ref<HTMLElement | null>(null)
const prevElem = ref<Element | null>(null)
const nextElem = ref<Element | null>(null)

const isMoving = ref(false)
const scrollY = ref(0)
const scrollX = ref(0)
const processY = ref(0) // от 0 до 1, где 1 - это прокручено до конца
const processX = ref(0) // от 0 до 1, где 1 - это прокручено до конца
const hasVBar = ref(false)
const hasHBar = ref(false)
const widthDiv = ref(0)
const heightDiv = ref(0)
const shadowLeft = ref(false)
const shadowRight = ref(false)
const shadowBottom = ref(false)

const shadowTop = computed(() => scrollY.value > 0)

const throttledScrollHandler = throttle(scrollHandler, 75, { leading: true })

watch(shadowTop, val => updateShadowTop(val))
watch(shadowLeft, val => updateShadowLeft(val))
watch(shadowRight, val => updateShadowRight(val))
watch(shadowBottom, val => updateShadowBottom(val))
watch(widthDiv, () => throttledScrollHandler(null))
watch(heightDiv, () => throttledScrollHandler(null))
watch(
  () => props.triggerScrollHandler,
  () => scrollHandler(null, true),
)

useResizeObserver(
  appScrollShadowRef,
  throttle((entries: ResizeObserverEntry[]) => {
    const { width, height } = entries[0]!.contentRect
    widthDiv.value = width
    heightDiv.value = height
  }, 50),
)

function updateShadowTop(val: boolean) {
  const payload: ShadowPayload = {
    position: 'top',
    process: processY.value,
    val,
    scrollTop: scrollY.value,
    type: 'vertical',
  }
  emit('update-shadow', payload)
  if (!props.ignoreAutoShadowTop && !props.ignoreAutoShadowAll) updateAutoShadow(payload)
}

function updateShadowBottom(val: boolean) {
  const payload: ShadowPayload = {
    position: 'bottom',
    process: processY.value,
    val,
    scrollTop: scrollY.value,
    type: 'vertical',
  }
  emit('update-shadow', payload)
  if (!props.ignoreAutoShadowBottom && !props.ignoreAutoShadowAll) updateAutoShadow(payload)
}

function updateShadowLeft(val: boolean) {
  const payload: ShadowPayload = {
    position: 'left',
    process: processX.value,
    val,
    scrollLeft: scrollX.value,
    type: 'horizontal',
  }
  emit('update-shadow', payload)
  if (!props.ignoreAutoShadowLeft && !props.ignoreAutoShadowAll) updateAutoShadow(payload)
}

function updateShadowRight(val: boolean) {
  const payload: ShadowPayload = {
    position: 'right',
    process: processX.value,
    val,
    scrollLeft: scrollX.value,
    type: 'horizontal',
  }
  emit('update-shadow', payload)
  if (!props.ignoreAutoShadowRight && !props.ignoreAutoShadowAll) updateAutoShadow(payload)
}

function scrollHandler(_event: Event | null, force = false) {
  if (!appScrollShadowRef.value) return

  // top and bottom
  const { scrollHeight, offsetHeight, clientHeight, scrollTop } = appScrollShadowRef.value
  const isChangedScrollY = scrollTop !== scrollY.value
  const contentHeight = Math.max(scrollHeight, offsetHeight, clientHeight)
  const overflowY = getComputedStyle(appScrollShadowRef.value).overflowY
  const isScrollableY = overflowY === 'auto' || overflowY === 'scroll'

  hasVBar.value = isScrollableY && contentHeight > clientHeight
  scrollY.value = scrollTop
  const processFull = contentHeight - clientHeight
  const bottomScrollY = processFull - scrollTop
  shadowBottom.value = hasVBar.value && bottomScrollY > 10
  processY.value = hasVBar.value ? (processFull - bottomScrollY) / processFull : 0

  // left and right
  const { scrollWidth, scrollLeft, offsetWidth } = appScrollShadowRef.value
  const isChangedScrollX = scrollLeft !== scrollX.value
  const overflowX = getComputedStyle(appScrollShadowRef.value).overflowX
  const isScrollableX = overflowX === 'auto' || overflowX === 'scroll'

  hasHBar.value = isScrollableX && scrollWidth > offsetWidth
  if (!isMoving.value) scrollX.value = scrollLeft
  shadowRight.value = hasHBar.value && scrollWidth - scrollLeft - offsetWidth >= 1
  shadowLeft.value = hasHBar.value && scrollLeft > 0
  // processX.value = // пока нигде не используется, не доделано

  if (force) {
    updateShadowTop(shadowTop.value)
    updateShadowLeft(shadowLeft.value)
    updateShadowRight(shadowRight.value)
    updateShadowBottom(shadowBottom.value)
  }

  const payload: ScrollPayload = { hasHBar: hasHBar.value, hasVBar: hasVBar.value }

  if (isChangedScrollY) {
    payload.type = 'vertical'
    payload.process = processY.value
    payload.scrollTop = scrollTop
  } else if (isChangedScrollX) {
    payload.type = 'horizontal'
    payload.process = processX.value
    payload.scrollLeft = scrollLeft
  }

  emit('scroll-handler', payload)
}

function updateAutoShadow(data: ShadowPayload) {
  const payload = { ...data }
  const isStart = data.position === 'top' || data.position === 'left'

  if (isStart) {
    let newPrevElem = appScrollShadowRef.value?.previousElementSibling ?? null

    // если нет соседнего элемента, то ищем родителя
    if (!newPrevElem) {
      newPrevElem = appScrollShadowRef.value?.parentElement ?? null
      payload.isParent = true
    }

    // если предыдущий элемент не равен текущему, то у прошлого удаляем класс
    if (prevElem.value !== newPrevElem) {
      toggleClass({ ...payload, elem: prevElem.value, val: false })
    }

    toggleClass({ ...payload, elem: newPrevElem })
    prevElem.value = newPrevElem
  } else {
    let newNextElem = appScrollShadowRef.value?.nextElementSibling ?? null

    // если нет соседнего элемента, то ищем родителя
    if (!newNextElem) {
      newNextElem = appScrollShadowRef.value?.parentElement ?? null
      payload.isParent = true
    }

    // если следующий элемент не равен текущему, то у прошлого удаляем класс
    if (nextElem.value !== newNextElem) {
      toggleClass({ ...payload, elem: nextElem.value, val: false })
    }
    toggleClass({ ...payload, elem: newNextElem })
    nextElem.value = newNextElem
  }
}

function toggleClass(data: ShadowPayload & { elem: Element | null, val?: boolean }) {
  if (!data.elem) return
  const className = `--app-scroll-shadow-${data.position}${data.isParent ? '_parent' : ''}`
  if (data.val) data.elem.classList.add(className)
  else data.elem.classList.remove(className)
}

// прокрутка с помощью движений мыши (нажать и перемещать) для горизонтального скролла
if (props.scrollWithMouseMovements) {
  const down = ref(false)
  const x = ref(0)

  function mouseLeaveHandler() {
    down.value = false
  }

  function mouseMoveHandler(event: MouseEvent) {
    if (down.value && hasHBar.value && appScrollShadowRef.value) {
      appScrollShadowRef.value.scrollLeft = scrollX.value + x.value - event.clientX
      shadowLeft.value = appScrollShadowRef.value.scrollLeft > 0
      isMoving.value = true
    }
  }

  function mouseDownHandler(event: MouseEvent) {
    down.value = true
    scrollX.value = appScrollShadowRef.value!.scrollLeft
    x.value = event.clientX
  }

  // отмена события перетаскивания ссылок (ondragstart)
  // без этого глючит когда при перетаскивании в табах хватаемся за ссылки
  function dragStartHandler(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
  }

  function mouseUpHandler(event: MouseEvent) {
    down.value = false
    if (!isMoving.value) return
    isMoving.value = false

    // если перемещение мыши было незначительное, то не предотвращать событие клика
    // иначе часто не переключалось на таб, т.к. происходило микро движение мыши
    if (Math.abs(x.value - event.clientX) < 20) return

    // предотвращает событие клика если было событие mouseMove
    window.addEventListener('click', captureClick, true)
    function captureClick(e: MouseEvent) {
      e.stopPropagation()
      e.preventDefault() // чтобы, в том числе, не осуществлялся переход по router-link
      window.removeEventListener('click', captureClick, true)
    }
  }

  onMounted(() => {
    const el = appScrollShadowRef.value!
    el.addEventListener('mouseleave', mouseLeaveHandler)
    el.addEventListener('mousemove', mouseMoveHandler)
    el.addEventListener('mousedown', mouseDownHandler)
    el.addEventListener('mouseup', mouseUpHandler)
    el.addEventListener('dragstart', dragStartHandler)
  })

  onBeforeUnmount(() => {
    const el = appScrollShadowRef.value
    if (!el) return
    el.removeEventListener('mouseleave', mouseLeaveHandler)
    el.removeEventListener('mousemove', mouseMoveHandler)
    el.removeEventListener('mousedown', mouseDownHandler)
    el.removeEventListener('mouseup', mouseUpHandler)
    el.removeEventListener('dragstart', dragStartHandler)
  })
}

defineExpose({ appScrollShadowRef, shadowTop })
</script>

<template>
  <div
    ref="appScrollShadowRef"
    class="app-scroll-shadow --custom-css-scrollbar"
    :class="{
      '--has-h-bar': hasHBar,
      '--has-v-bar': hasVBar,
      '--ignore-swipe': !withoutIgnoreSwipe,
      '--moving': isMoving,
      '--with-move': scrollWithMouseMovements,
      '--hide-scroll-bars': hideScrollBars,
    }"
    @scroll="throttledScrollHandler"
  >
    <slot />
  </div>
</template>

<style lang="scss">
.app-scroll-shadow {
  overflow: auto;

  &.--with-move.--has-h-bar {
    user-select: none;
    cursor: grab;
  }

  &.--moving,
  &.--moving a {
    cursor: grabbing;
  }

  &.--hide-scroll-bars {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none !important;
    }
  }
}

@mixin gradient-shadow($direction: 180deg) {
  $dir: $direction;

  @if $direction == 'top' {
    $dir: 180deg;
  } @else if $direction == 'left' {
    $dir: 90deg;
  } @else if $direction == 'right' {
    $dir: -90deg;
  } @else if $direction == 'bottom' {
    $dir: 0deg;
  }

  background: linear-gradient(
    $dir,
    var(--gradient-shadow-from-color) 0%,
    color-mix(in srgb, var(--gradient-shadow-from-color) 55%, transparent) 30%,
    color-mix(in srgb, var(--gradient-shadow-from-color) 20%, transparent) 60%,
    transparent 100%
  );
}

// top and bottom shadows

.--app-scroll-shadow-top,
.--app-scroll-shadow-top_parent,
.--app-scroll-shadow-bottom,
.--app-scroll-shadow-bottom_parent {
  position: relative;

  &:after {
    z-index: 10;
    content: '';
    pointer-events: none;
    display: block;
    width: 100%;
    height: var(--gradient-shadow-size, 1rem);
    position: absolute;
    left: 0;
    right: 0;
  }
}

.--app-scroll-shadow-top,
.--app-scroll-shadow-top_parent {
  &:after {
    @include gradient-shadow(top);
  }
}
.--app-scroll-shadow-top:after {
  bottom: calc(var(--gradient-shadow-size, 1rem) * -1 - 1px);
}
.--app-scroll-shadow-top_parent:after {
  top: 0;
}

.--app-scroll-shadow-bottom,
.--app-scroll-shadow-bottom_parent {
  &:after {
    @include gradient-shadow(bottom);
  }
}
.--app-scroll-shadow-bottom:after {
  top: calc(var(--gradient-shadow-size, 1rem) * -1 - 1px);
}
.--app-scroll-shadow-bottom_parent:after {
  bottom: 0;
}

// left and right shadows

.--app-scroll-shadow-right,
.--app-scroll-shadow-right_parent,
.--app-scroll-shadow-left,
.--app-scroll-shadow-left_parent {
  position: relative;

  &:after,
  &:before {
    z-index: 10;
    pointer-events: none;
    content: '';
    display: block;
    width: var(--gradient-shadow-size, 1rem);
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
  }
}
.--app-scroll-shadow-right,
.--app-scroll-shadow-right_parent {
  &:after {
    @include gradient-shadow(right);
  }
}
.--app-scroll-shadow-right:after {
  right: calc(var(--gradient-shadow-size, 1rem) * -1);
}
.--app-scroll-shadow-right_parent:after {
  right: 0;
}

.--app-scroll-shadow-left,
.--app-scroll-shadow-left_parent {
  &:before {
    @include gradient-shadow(left);
  }
}
.--app-scroll-shadow-left:before {
  left: calc(var(--gradient-shadow-size, 1rem) * -1);
}
.--app-scroll-shadow-left_parent:before {
  left: 0;
}
</style>
