import { describe, expect, it } from 'vitest'
import {
  addGlobalListener,
  decorateCanvas,
  installTouchBridge,
  removeGlobalListener
} from '../src/platform/mini-events'

type Handler = (event: unknown) => void

describe('小游戏触摸事件桥接', () => {
  it('把 touch 事件转换为 Pixi 需要的 pointer 事件', () => {
    const handlers: Record<string, Handler> = {}
    const api = {
      onTouchStart: (callback: Handler) => {
        handlers.start = callback
      },
      onTouchMove: (callback: Handler) => {
        handlers.move = callback
      },
      onTouchEnd: (callback: Handler) => {
        handlers.end = callback
      },
      onTouchCancel: (callback: Handler) => {
        handlers.cancel = callback
      }
    }
    installTouchBridge(api)

    const canvas = decorateCanvas({} as HTMLCanvasElement, {
      windowWidth: 375,
      windowHeight: 667,
      pixelRatio: 2,
      platform: 'devtools',
      safeArea: { top: 0, bottom: 667, left: 0, right: 375, width: 375, height: 667 }
    })

    const events: Array<Record<string, unknown>> = []
    const listener = (event: unknown) => events.push(event as Record<string, unknown>)
    addGlobalListener('pointerdown', listener)

    handlers.start({
      changedTouches: [{ identifier: 7, clientX: 120, clientY: 240 }],
      touches: []
    })

    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('pointerdown')
    expect(events[0].pointerId).toBe(7)
    expect(events[0].clientX).toBe(120)
    expect(events[0].clientY).toBe(240)
    expect(events[0].target).toBe(canvas)

    removeGlobalListener('pointerdown', listener)

    const rect = (canvas as unknown as { getBoundingClientRect(): { width: number } })
      .getBoundingClientRect()
    expect(rect.width).toBe(375)
  })
})
