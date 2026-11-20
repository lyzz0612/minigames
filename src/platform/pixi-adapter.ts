import { DOMAdapter } from 'pixi.js'
import type { Adapter } from 'pixi.js'
import type { Platform } from './types'

type AnyRecord = Record<string, any>

/**
 * Pixi 用 `gl instanceof WebGLRenderingContext` 判断 WebGL1/2。
 * 小游戏没有这个全局类，所以给一个带 Symbol.hasInstance 的类：
 * 没有 WebGL2 独有的 createQuery 方法即视为 WebGL1。
 */
class WebGL1Context {
  static [Symbol.hasInstance](value: unknown): boolean {
    const context = value as AnyRecord | null
    return !!context && typeof context.createQuery !== 'function'
  }
}

function createCanvasRenderingContext2DShim(): typeof CanvasRenderingContext2D {
  return function CanvasRenderingContext2DShim() {} as unknown as typeof CanvasRenderingContext2D
}

export function installPixiAdapter(platform: Platform): void {
  if (!platform.isMiniGame) return

  const context2d = createCanvasRenderingContext2DShim()

  const adapter: Adapter = {
    createCanvas: (width, height) => platform.createCanvas(width, height),
    createImage: () => platform.createImage(),
    getCanvasRenderingContext2D: () => context2d,
    getWebGLRenderingContext: () => WebGL1Context as unknown as typeof WebGLRenderingContext,
    getNavigator: () => ({ userAgent: `MiniGame/${platform.name}`, gpu: null }),
    getBaseUrl: () => '',
    getFontFaceSet: () => null,
    fetch: () => Promise.reject(new Error('小游戏环境不支持 fetch，请使用平台音频/图片 API')),
    parseXML: () => ({}) as Document
  }

  DOMAdapter.set(adapter)
}
