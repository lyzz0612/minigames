import type { AudioHandle, Platform, PlatformName, SystemInfo } from './types'
import { decorateCanvas } from './mini-events'

type AnyRecord = Record<string, any>

class MiniGameAudioHandle implements AudioHandle {
  private context: AnyRecord
  private playing = false
  private canPlay: (() => void) | null = null
  private ended: (() => void) | null = null
  private error: ((message: string) => void) | null = null

  constructor(private api: AnyRecord, src: string) {
    this.context = api.createInnerAudioContext()
    this.context.src = src
    this.context.onCanplay(() => this.canPlay?.())
    this.context.onEnded(() => {
      this.playing = false
      this.ended?.()
    })
    this.context.onError((event: AnyRecord) => {
      this.playing = false
      this.error?.(event?.errMsg ?? '音频播放失败')
    })
  }

  get currentTime(): number {
    return Number(this.context.currentTime ?? 0)
  }

  get duration(): number {
    return Number(this.context.duration ?? 0)
  }

  get paused(): boolean {
    return !this.playing
  }

  play(): void {
    this.playing = true
    this.context.play()
  }

  pause(): void {
    this.playing = false
    this.context.pause()
  }

  stop(): void {
    this.playing = false
    this.context.stop()
  }

  seek(time: number): void {
    this.context.seek(Math.max(0, time))
  }

  setVolume(volume: number): void {
    this.context.volume = Math.max(0, Math.min(1, volume))
  }

  setLoop(loop: boolean): void {
    this.context.loop = loop
  }

  setSrc(src: string): void {
    this.playing = false
    this.context.src = src
  }

  onCanPlay(callback: () => void): void {
    this.canPlay = callback
  }

  onEnded(callback: () => void): void {
    this.ended = callback
  }

  onError(callback: (message: string) => void): void {
    this.error = callback
  }

  destroy(): void {
    this.context.destroy?.()
  }
}

export function createMiniGamePlatform(api: AnyRecord, name: PlatformName): Platform {
  let keyboardHandlers:
    | {
        onInput?: (value: string) => void
        onConfirm?: (value: string) => void
        onComplete?: (value: string) => void
      }
    | null = null

  api.onKeyboardInput?.((event: AnyRecord) => keyboardHandlers?.onInput?.(event.value ?? ''))
  api.onKeyboardConfirm?.((event: AnyRecord) => keyboardHandlers?.onConfirm?.(event.value ?? ''))
  api.onKeyboardComplete?.((event: AnyRecord) => keyboardHandlers?.onComplete?.(event.value ?? ''))

  const getSystemInfo = (): SystemInfo => {
    const raw = api.getSystemInfoSync?.() ?? {}
    const windowWidth = Number(raw.windowWidth ?? 375)
    const windowHeight = Number(raw.windowHeight ?? 667)
    const safeArea = raw.safeArea ?? {
      top: 0,
      bottom: windowHeight,
      left: 0,
      right: windowWidth,
      width: windowWidth,
      height: windowHeight
    }
    return {
      windowWidth,
      windowHeight,
      pixelRatio: Number(raw.pixelRatio ?? 1),
      platform: String(raw.platform ?? name),
      safeArea: {
        top: Number(safeArea.top ?? 0),
        bottom: Number(safeArea.bottom ?? windowHeight),
        left: Number(safeArea.left ?? 0),
        right: Number(safeArea.right ?? windowWidth),
        width: Number(safeArea.width ?? windowWidth),
        height: Number(safeArea.height ?? windowHeight)
      }
    }
  }

  return {
    name,
    isMiniGame: true,
    createCanvas(width = 300, height = 150) {
      const canvas = api.createCanvas() as HTMLCanvasElement
      canvas.width = width
      canvas.height = height
      return decorateCanvas(canvas, getSystemInfo())
    },
    createImage() {
      return api.createImage() as HTMLImageElement
    },
    getSystemInfo,
    createAudio(src: string) {
      return new MiniGameAudioHandle(api, src)
    },
    storage: {
      get(key) {
        const value = api.getStorageSync?.(key)
        return value === '' || value === undefined || value === null ? null : String(value)
      },
      set(key, value) {
        api.setStorageSync?.(key, value)
      },
      remove(key) {
        api.removeStorageSync?.(key)
      }
    },
    now() {
      const performanceLike = (globalThis as AnyRecord).performance
      return typeof performanceLike?.now === 'function' ? performanceLike.now() : Date.now()
    },
    requestAnimationFrame(callback) {
      const global = globalThis as AnyRecord
      if (typeof global.requestAnimationFrame === 'function') {
        return global.requestAnimationFrame(callback)
      }
      return setTimeout(() => callback(Date.now()), 16) as unknown as number
    },
    cancelAnimationFrame(id) {
      const global = globalThis as AnyRecord
      if (typeof global.cancelAnimationFrame === 'function') {
        global.cancelAnimationFrame(id)
      } else {
        clearTimeout(id)
      }
    },
    showKeyboard(options, handlers) {
      keyboardHandlers = handlers
      api.showKeyboard?.({
        defaultValue: options.defaultValue ?? '',
        maxLength: options.maxLength ?? 140,
        multiple: false,
        confirmHold: true,
        confirmType: 'done'
      })
    },
    hideKeyboard() {
      api.hideKeyboard?.()
    },
    onShow(callback) {
      api.onShow?.(callback)
    },
    onHide(callback) {
      api.onHide?.(callback)
    }
  }
}
