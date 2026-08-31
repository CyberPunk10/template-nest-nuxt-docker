/**
 * Блокирует скролл страницы под оверлеями (drawer, модалки).
 * Заодно резервирует место скроллбара, чтобы контент не прыгал.
 */
export const useBodyScrollLock = () => {
  const isLocked = ref(false)
  let restoreOverflow = ''

  function applyLock() {
    const { body, documentElement } = document

    // замер ширины скролла зависит от ОС и браузера (Windows ~17px, Linux 15px),
    // поэтому меряем фактическую, а не подставляем константу
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth
    documentElement.style.setProperty('--scrollbar-compensation', `${Math.max(scrollbarWidth, 0)}px`)

    restoreOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }

  function releaseLock() {
    document.body.style.overflow = restoreOverflow
    document.documentElement.style.removeProperty('--scrollbar-compensation')
  }

  watch(isLocked, locked => locked ? applyLock() : releaseLock())

  // страховка: если оверлей размонтировали, не сняв лок, скролл остался бы
  // заблокированным навсегда - снимаем сами.
  onScopeDispose(() => {
    if (isLocked.value) releaseLock()
  })

  return { isLocked }
}
