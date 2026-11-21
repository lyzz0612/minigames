export type PlatformName = 'web' | 'wechat' | 'douyin'

export interface SafeArea {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

export interface SystemInfo {
  windowWidth: number
  windowHeight: number
  pixelRatio: number
  safeArea: SafeArea
  platform: string
}

/** 统一的音频句柄，屏蔽 HTMLAudioElement 与 InnerAudioContext 的差异。 */
export interface AudioHandle {
  play(): void
  pause(): void
  stop(): void
  seek(time: number): void
  setVolume(volume: number): void
  setLoop(loop: boolean): void
  setSrc(src: string): void
  readonly currentTime: number
  readonly duration: number
  readonly paused: boolean
  onCanPlay(callback: () => void): void
  onEnded(callback: () => void): void
  onError(callback: (message: string) => void): void
  destroy(): void
}

export interface KeyboardOptions {
  defaultValue?: string
  maxLength?: number
}

export interface KeyboardHandlers {
  onInput?: (value: string) => void
  onConfirm?: (value: string) => void
  onComplete?: (value: string) => void
}

export interface Storage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

export interface Platform {
  readonly name: PlatformName
  /** 小游戏环境为 true，浏览器 H5 为 false。 */
  readonly isMiniGame: boolean
  createCanvas(width?: number, height?: number): HTMLCanvasElement
  createImage(): HTMLImageElement
  getSystemInfo(): SystemInfo
  createAudio(src: string): AudioHandle
  readonly storage: Storage
  now(): number
  requestAnimationFrame(callback: (time: number) => void): number
  cancelAnimationFrame(id: number): void
  /** 仅小游戏实现，H5 由 Input 组件使用隐藏 input。 */
  showKeyboard?(options: KeyboardOptions, handlers: KeyboardHandlers): void
  hideKeyboard?(): void
  onShow(callback: () => void): void
  onHide(callback: () => void): void
  onResize(callback: (info: SystemInfo) => void): void
}
