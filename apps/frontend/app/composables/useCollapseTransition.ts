export function useCollapseTransition() {
  function onEnter(el: HTMLElement) {
    el.style.height = '0'
    el.style.overflow = 'hidden'
    requestAnimationFrame(() => {
      el.style.height = el.scrollHeight + 'px'
    })
  }

  function onAfterEnter(el: HTMLElement) {
    el.style.height = ''
    el.style.overflow = ''
  }

  function onLeave(el: HTMLElement) {
    el.style.height = el.scrollHeight + 'px'
    el.style.overflow = 'hidden'
    requestAnimationFrame(() => {
      el.style.height = '0'
    })
  }

  function onAfterLeave(el: HTMLElement) {
    el.style.height = ''
    el.style.overflow = ''
  }

  return { onEnter, onAfterEnter, onLeave, onAfterLeave }
}
