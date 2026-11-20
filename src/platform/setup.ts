/**
 * 必须在 import pixi.js 之前执行。
 * main.ts 的第一行 import 这个模块，ESM 求值顺序保证全局 shim 先于 Pixi 模块执行。
 */
import { getPlatform, getRawPlatformApi } from './index'
import { installMiniGlobals } from './mini-globals'

const platform = getPlatform()

if (platform.isMiniGame) {
  installMiniGlobals(platform, getRawPlatformApi())
}
