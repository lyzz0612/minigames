import type { AudioHandle, Platform, SafeArea, SystemInfo } from './types'

function readSafeArea(width: number, height: number): SafeArea {
  const probe = document.createElement('div')
  probe.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'padding-top:env(safe-area-inset-top)',
    'padding-right:env(safe-area-inset-right)',
    'padding-bottom:env(safe-area-inset-bottom)',
    'padding-left:env(safe-area-inset-left)',
    'visibility:hidden',
    'pointer-events:none'
  ].join(';')
  document.body.appendChild(probe)
  const style = getComputedStyle(probe)
  const top = parseFloat(style.paddingTop) || 0
  const right = parseFloat(style.paddingRight) || 0
  const bottom = parseFloat(style.paddingBottom) || 0
  const left = parseFloat(style.paddingLeft) || 0
  document.body.removeChild(probe)
  return { top, right, bottom, left, width: width - left - right, height: height - top - bottom }
}

class WebAudioHandle implements AudioHandle {
  private element: HTMLAudioElement
  private canPlay: (() => void) | null = null
  private ended: (() => void) | null = null
  private error: ((message: string) => void) | null = null

  constructor(src: string) {
    this.element = new Audio(src)
    this.element.preload = 'auto'
    this.element.addEventListener('canplay', () => this.canPlay?.())
    this.element.addEventListener('ended', () => this.ended?.())
    this.element.addEventListener('error', () => this.error?.('音频加载失败'))
  }

  get currentTime(): number {
    return this.element.currentTime
  }

  get duration(): number {
    const value = this.element.duration
    return Number.isFinite(value) ? value : 0
  }

  get paused(): boolean {
    return this.element.paused
  }

  play(): void {
    void this.element.play().catch(() => {
      this.error?.('播放被浏览器拦截，请再次点击')
    })
  }

  pause(): void {
    this.element.pause()
  }

  stop(): void {
    this.element.pause()
    this.element.currentTime = 0
  }

  seek(time: number): void {
    this.element.currentTime = time
  }

  setVolume(volume: number): void {
    this.element.volume = Math.max(0, Math.min(1, volume))
  }

  setLoop(loop: boolean): void {
    this.element.loop = loop
  }

  setSrc(src: string): void {
    this.element.src = src
    this.element.load()
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
    this.element.pause()
    this.element.removeAttribute('src')
    this.element.load()
  }
}

export function createWebPlatform(): Platform {
  const systemInfo = (): SystemInfo => {
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      windowWidth: width,
      windowHeight: height,
      pixelRatio: window.devicePixelRatio || 1,
      safeArea: readSafeArea(width, height),
      platform: 'h5'
    }
  }

  return {
    name: 'web',
    isMiniGame: false,
    createCanvas(width = 300, height = 150) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      return canvas
    },
    createImage() {
      return new Image()
    },
    getSystemInfo: systemInfo,
    createAudio(src: string) {
      return new WebAudioHandle(src)
    },
    storage: {
      get(key) {
        try {
          return window.localStorage.getItem(key)
        } catch {
          return null
        }
      },
      set(key, value) {
        try {
          window.localStorage.setItem(key, value)
        } catch {
          /* 隐私模式下忽略 */
        }
      },
      remove(key) {
        try {
          window.localStorage.removeItem(key)
        } catch {
          /* 隐私模式下忽略 */
        }
      }
    },
    now() {
      return performance.now()
    },
    requestAnimationFrame(callback) {
      return window.requestAnimationFrame(callback)
    },
    cancelAnimationFrame(id) {
      window.cancelAnimationFrame(id)
    },
    onShow(callback) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) callback()
      })
    },
    onHide(callback) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) callback()
      })
    },
    onResize(callback) {
      window.addEventListener('resize', () => callback(systemInfo()))
    }
  }
}
