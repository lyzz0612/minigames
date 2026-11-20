import type { Platform } from './types'
import {
  MiniPointerEvent,
  MiniTouchEvent,
  addGlobalListener,
  dispatchGlobalEvent,
  installTouchBridge,
  removeGlobalListener
} from './mini-events'

type AnyRecord = Record<string, any>

function createStubElement(tagName: string): AnyRecord {
  return {
    tagName: tagName.toUpperCase(),
    style: {},
    children: [] as unknown[],
    appendChild(child: unknown) {
      this.children.push(child)
      return child
    },
    removeChild(child: unknown) {
      const index = this.children.indexOf(child)
      if (index >= 0) this.children.splice(index, 1)
      return child
    },
    setAttribute() {},
    getAttribute() {
      return null
    },
    removeAttribute() {},
    addEventListener(type: string, listener: (event: unknown) => void) {
      addGlobalListener(type, listener)
    },
    removeEventListener(type: string, listener: (event: unknown) => void) {
      removeGlobalListener(type, listener)
    },
    getBoundingClientRect() {
      return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
    },
    contains() {
      return false
    }
  }
}

function createDocument(platform: Platform): AnyRecord {
  const info = platform.getSystemInfo()
  const body = createStubElement('body')
  const documentElement = createStubElement('html')
  documentElement.clientWidth = info.windowWidth
  documentElement.clientHeight = info.windowHeight

  return {
    __miniGame: true,
    body,
    documentElement,
    fonts: null,
    baseURI: '',
    hidden: false,
    visibilityState: 'visible',
    createElement(tag: string) {
      return tag === 'canvas' ? platform.createCanvas() : createStubElement(tag)
    },
    createElementNS(_namespace: string, tag: string) {
      return createStubElement(tag)
    },
    addEventListener(type: string, listener: (event: unknown) => void) {
      addGlobalListener(type, listener)
    },
    removeEventListener(type: string, listener: (event: unknown) => void) {
      removeGlobalListener(type, listener)
    },
    dispatchEvent(event: { type: string }) {
      dispatchGlobalEvent(event.type, event)
      return true
    },
    querySelector() {
      return null
    },
    getElementById() {
      return null
    }
  }
}

/**
 * 在 import pixi.js 之前执行，给 Pixi v8 补齐它对浏览器全局对象的依赖。
 * 顺序很重要：main.ts 的第一个 import 必须是小游戏平台安装模块。
 */
export function installMiniGlobals(platform: Platform, api: AnyRecord): void {
  const global = globalThis as AnyRecord
  if (global.document?.__miniGame) return

  installTouchBridge(api)

  const info = platform.getSystemInfo()

  if (!global.window) global.window = global
  if (!global.document) global.document = createDocument(platform)

  if (!global.navigator) {
    global.navigator = {
      userAgent: `MiniGame/${platform.name}`,
      platform: platform.name,
      maxTouchPoints: 1,
      gpu: null
    }
  }

  if (!global.performance || typeof global.performance.now !== 'function') {
    global.performance = { now: () => Date.now() }
  }

  if (typeof global.requestAnimationFrame !== 'function') {
    global.requestAnimationFrame = (callback: (time: number) => void) =>
      setTimeout(() => callback(platform.now()), 16)
    global.cancelAnimationFrame = (id: number) => clearTimeout(id)
  }

  if (typeof global.addEventListener !== 'function') {
    global.addEventListener = (type: string, listener: (event: unknown) => void) => {
      addGlobalListener(type, listener)
    }
    global.removeEventListener = (type: string, listener: (event: unknown) => void) => {
      removeGlobalListener(type, listener)
    }
  }

  if (!global.PointerEvent) global.PointerEvent = MiniPointerEvent
  if (!global.TouchEvent) global.TouchEvent = MiniTouchEvent
  if (!('ontouchstart' in global)) global.ontouchstart = null

  if (!global.localStorage) {
    global.localStorage = {
      getItem: (key: string) => platform.storage.get(key),
      setItem: (key: string, value: string) => platform.storage.set(key, String(value)),
      removeItem: (key: string) => platform.storage.remove(key),
      clear: () => undefined,
      key: () => null,
      length: 0
    }
  }

  if (!global.Image) {
    global.Image = function MiniGameImage() {
      return platform.createImage()
    }
  }

  global.devicePixelRatio = global.devicePixelRatio ?? info.pixelRatio
  global.innerWidth = global.innerWidth ?? info.windowWidth
  global.innerHeight = global.innerHeight ?? info.windowHeight
}
