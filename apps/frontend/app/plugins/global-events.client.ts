import mitt from 'mitt'

interface GlobalEvent {
  name: string
  callback: (...args: unknown[]) => void
  args?: unknown
}

/*
Плагин для возможности общения между вкладками
this.$globalSyncEvents.emit('event-name', data);
this.$globalSyncEvents.on('event-name', callbackFn);
this.$globalSyncEvents.off('event-name', callbackFn);
 */
class GlobalEvents {
  EVENT_EXISTS = 'GlobalEvents: Event already exists.'

  eventIsRunning = false
  storage = window.localStorage
  eventStack: GlobalEvent[] = []
  boundEventListener = this.eventListener.bind(this)

  constructor() {
    this.listen()
  }

  emit(eventName, transportObject) {
    this.setItem(eventName, transportObject)
    this.unlisten()

    setTimeout(() => {
      this.removeItem(eventName)
      this.listen()
    })
  }

  on(eventName, callback, args) {
    if (this.findByName(eventName)) {
      throw new Error(this.EVENT_EXISTS)
    } else {
      const event = {
        name: eventName,
        callback,
      }

      if (args) {
        event.args = args
      }

      this.eventStack.push(event)
    }
  }

  off(eventName) {
    const event = this.findByName(eventName)
    if (!event) return
    const idx = this.eventStack.indexOf(event)
    this.eventStack.splice(idx, 1)
  }

  setItem(key, value) {
    this.storage.setItem(key, value || '_evt')
  }

  removeItem(key) {
    this.storage.removeItem(key)
  }

  findByName(eventName) {
    return this.eventStack.find(event => event.name === eventName)
  }

  parse(val) {
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }

  eventListener(e) {
    const event = this.findByName(e.key)
    const val = e.newValue
    const params = []

    if (event && !this.eventIsRunning) {
      this.eventIsRunning = true

      if (event.args) {
        params.push(event.args)
      }
      if (val && val !== '_evt') {
        params.push(this.parse(val))
      }

      event.callback.apply(this, params)

      setTimeout(() => {
        this.eventIsRunning = false
      }, 10)
    }
  }

  listen() {
    window.addEventListener('storage', this.boundEventListener)
  }

  unlisten() {
    window.removeEventListener('storage', this.boundEventListener)
  }
}

export default defineNuxtPlugin(() => {
  const emitter = mitt()
  const globalEvents = new GlobalEvents()

  const on = (...args) => emitter.on(...args)
  const off = (...args) => emitter.off(...args)
  const emit = (...args) => emitter.emit(...args)

  return {
    provide: {
      globalSyncEvents: globalEvents,
      globalEvents: {
        // Nuxt Event Bus
        on,
        off,
        emit,
      },
    },
  }
})
