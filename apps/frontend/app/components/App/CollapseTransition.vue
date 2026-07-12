<script setup lang="ts">
function onEnter(el: Element) {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.overflow = 'hidden'
  void element.offsetHeight // force reflow to ensure height:0 is rendered before transition starts
  element.style.height = element.scrollHeight + 'px'
}

function onAfterEnter(el: Element) {
  const element = el as HTMLElement
  element.style.height = ''
  element.style.overflow = ''
}

function onLeave(el: Element) {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.style.overflow = 'hidden'
  void element.offsetHeight // force reflow
  element.style.height = '0'
}

function onAfterLeave(el: Element) {
  const element = el as HTMLElement
  element.style.height = ''
  element.style.overflow = ''
}
</script>

<template>
  <Transition
    name="collapse"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </Transition>
</template>

<style>
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.25s var(--ease-default);
  overflow: hidden;
}
</style>
