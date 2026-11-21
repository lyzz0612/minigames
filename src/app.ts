import { Application } from 'pixi.js'
import { getPlatform } from './platform'
import { installPixiAdapter } from './platform/pixi-adapter'
import { DemoApp } from './demo/demo-app'
import { THEME } from './ui/theme'

type AnyRecord = Record<string, any>

export async function bootstrap(): Promise<void> {
  const platform = getPlatform()
  installPixiAdapter(platform)

  const info = platform.getSystemInfo()
  const canvas = platform.createCanvas(info.windowWidth, info.windowHeight)

  if (!platform.isMiniGame) {
    canvas.style.width = `${info.windowWidth}px`
    canvas.style.height = `${info.windowHeight}px`
    canvas.style.display = 'block'
    canvas.style.touchAction = 'none'
    document.body.appendChild(canvas)
  }

  const app = new Application()
  await app.init({
    canvas,
    width: info.windowWidth,
    height: info.windowHeight,
    resolution: info.pixelRatio,
    autoDensity: true,
    antialias: true,
    background: THEME.colors.background,
    preference: 'webgl',
    hello: false,
    powerPreference: 'high-performance'
  })

  new DemoApp(app, platform)

  ;(globalThis as AnyRecord).__PIXI_APP__ = app
}
