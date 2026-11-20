import type { Platform, PlatformName } from './types'
import { createWebPlatform } from './web'
import { createMiniGamePlatform } from './minigame'

declare const __PLATFORM__: PlatformName

type AnyRecord = Record<string, any>

let cached: Platform | null = null
let rawApi: AnyRecord | null = null

function buildTarget(): PlatformName | null {
  try {
    return typeof __PLATFORM__ === 'string' ? __PLATFORM__ : null
  } catch {
    return null
  }
}

/**
 * 平台检测优先级：构建目标 > 运行时全局对象 > H5。
 * 这样三个 target 可以共用同一份源码。
 */
export function getPlatform(): Platform {
  if (cached) return cached
  const global = globalThis as AnyRecord
  const target = buildTarget()

  if (target === 'wechat' && global.wx) {
    rawApi = global.wx
    cached = createMiniGamePlatform(global.wx, 'wechat')
  } else if (target === 'douyin' && global.tt) {
    rawApi = global.tt
    cached = createMiniGamePlatform(global.tt, 'douyin')
  } else if (global.tt) {
    rawApi = global.tt
    cached = createMiniGamePlatform(global.tt, 'douyin')
  } else if (global.wx) {
    rawApi = global.wx
    cached = createMiniGamePlatform(global.wx, 'wechat')
  } else {
    cached = createWebPlatform()
  }

  return cached
}

export function getRawPlatformApi(): AnyRecord {
  getPlatform()
  return rawApi ?? (globalThis as AnyRecord)
}

export * from './types'
