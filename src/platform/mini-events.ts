/**
 * 小游戏没有 DOM 事件系统，这里把 wx/tt 的 touch 事件桥接成 Pixi v8 需要的
 * pointer 事件，并提供 document / window 级监听的最小实现。
 */
import type { Platform, SystemInfo } from './types'

type Listener = (event: unknown) => void

const listeners = new Map<string, Set<Listener>>()
let mainCanvas: unknown = null
let bridgeInstalled = false

const POINTER_TYPES = new Set([
  'pointerdown',
  'pointerup',
  'pointermove',
  'pointercancel',
  'pointerover',
  'pointerout',
  'pointerleave',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseover',
  'mouseout',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'wheel',
  'contextmenu',
  'webglcontextlost',
  'webglcontextrestored'
])

export class MiniPointerEvent {
  type: string
  target: unknown
  currentTarget: unknown
  srcElement: unknown
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  screenX: number
  screenY: number
  x: number
  y: number
  offsetX: number
  offsetY: number
  layerX: number
  layerY: number
  movementX = 0
  movementY = 0
  pointerId: number
  pointerType: string
  isPrimary = true
  button = 0
  buttons = 1
  width = 1
  height = 1
  pressure = 0.5
  tangentialPressure = 0
  tiltX = 0
  tiltY = 0
  twist = 0
  altitudeAngle = Math.PI / 2
  azimuthAngle = 0
  detail = 0
  altKey = false
  ctrlKey = false
  metaKey = false
  shiftKey = false
  bubbles = true
  cancelable = true
  composed = true
  defaultPrevented = false
  isNormalized = true
  nativeEvent: unknown

  constructor(type: string, init: Record<string, unknown> = {}) {
    this.type = type
    this.nativeEvent = init.nativeEvent ?? null
    this.clientX = Number(init.clientX ?? 0)
    this.clientY = Number(init.clientY ?? 0)
    this.pageX = this.clientX
    this.pageY = this.clientY
    this.screenX = this.clientX
    this.screenY = this.clientY
    this.x = this.clientX
    this.y = this.clientY
    this.offsetX = this.clientX
    this.offsetY = this.clientY
    this.layerX = this.clientX
    this.layerY = this.clientY
    this.pointerId = Number(init.pointerId ?? 1)
    this.pointerType = String(init.pointerType ?? 'touch')
    this.buttons = type === 'pointerup' || type === 'touchend' ? 0 : 1
  }

  preventDefault(): void {
    this.defaultPrevented = true
  }

  stopPropagation(): void {}

  stopImmediatePropagation(): void {}

  composedPath(): unknown[] {
    return [this.target]
  }

  getModifierState(): boolean {
    return false
  }
}

export class MiniTouchEvent {}

export function addGlobalListener(type: string, listener: Listener): void {
  let set = listeners.get(type)
  if (!set) {
    set = new Set()
    listeners.set(type, set)
  }
  set.add(listener)
}

export function removeGlobalListener(type: string, listener: Listener): void {
  listeners.get(type)?.delete(listener)
}

export function dispatchGlobalEvent(type: string, event: unknown): void {
  const set = listeners.get(type)
  if (!set) return
  set.forEach(listener => {
    try {
      listener(event)
    } catch (error) {
      console.error(`[input] listener error for ${type}`, error)
    }
  })
}

function buildEvent(type: string, touch: Record<string, number>, canvas: unknown): MiniPointerEvent {
  const clientX = Number(touch.clientX ?? touch.pageX ?? touch.x ?? 0)
  const clientY = Number(touch.clientY ?? touch.pageY ?? touch.y ?? 0)
  const event = new MiniPointerEvent(type, {
    clientX,
    clientY,
    pointerId: Number(touch.identifier ?? 1),
    pointerType: 'touch'
  })
  event.target = canvas
  event.currentTarget = canvas
  event.srcElement = canvas
  return event
}

function emit(type: string, touch: Record<string, number>): void {
  if (!mainCanvas) return
  dispatchGlobalEvent(type, buildEvent(type, touch, mainCanvas))
}

function emitTouch(type: 'start' | 'move' | 'end' | 'cancel', payload: unknown): void {
  const data = payload as { changedTouches?: Record<string, number>[]; touches?: Record<string, number>[] }
  const touches = data.changedTouches?.length ? data.changedTouches : data.touches ?? []
  const pointerType = type === 'start' ? 'pointerdown' : type === 'move' ? 'pointermove' : type === 'end' ? 'pointerup' : 'pointercancel'
  const touchType = type === 'start' ? 'touchstart' : type === 'move' ? 'touchmove' : type === 'end' ? 'touchend' : 'touchcancel'
  touches.forEach(touch => {
    emit(pointerType, touch)
    emit(touchType, touch)
  })
}

export function installTouchBridge(api: {
  onTouchStart?: (callback: (event: unknown) => void) => void
  onTouchMove?: (callback: (event: unknown) => void) => void
  onTouchEnd?: (callback: (event: unknown) => void) => void
  onTouchCancel?: (callback: (event: unknown) => void) => void
}): void {
  if (bridgeInstalled) return
  bridgeInstalled = true
  api.onTouchStart?.(event => emitTouch('start', event))
  api.onTouchMove?.(event => emitTouch('move', event))
  api.onTouchEnd?.(event => emitTouch('end', event))
  api.onTouchCancel?.(event => emitTouch('cancel', event))
}

export function decorateCanvas(canvas: HTMLCanvasElement, info: SystemInfo): HTMLCanvasElement {
  const target = canvas as unknown as Record<string, unknown>
  if (!mainCanvas) mainCanvas = canvas

  target.style = target.style ?? {}
  target.isConnected = true
  target.clientWidth = info.windowWidth
  target.clientHeight = info.windowHeight
  target.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: info.windowWidth,
    bottom: info.windowHeight,
    width: info.windowWidth,
    height: info.windowHeight,
    toJSON() {
      return {}
    }
  })
  target.addEventListener = (type: string, listener: Listener) => {
    if (POINTER_TYPES.has(type)) addGlobalListener(type, listener)
  }
  target.removeEventListener = (type: string, listener: Listener) => {
    removeGlobalListener(type, listener)
  }
  target.setAttribute = () => undefined
  target.getAttribute = () => null

  return canvas
}
