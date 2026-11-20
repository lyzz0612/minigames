import { getPlatform } from '../platform'
import type { AudioHandle } from '../platform/types'

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

/**
 * 三端统一的播放器状态机。
 * 小游戏 InnerAudioContext 与 HTMLAudioElement 的差异封装在 Platform.createAudio 里。
 */
export class TrackPlayer {
  private handle: AudioHandle | null = null
  private status: PlayerStatus = 'idle'
  private message = ''
  private volume = 0.8
  private loop = false
  private listeners = new Set<() => void>()

  constructor(private src: string) {
    this.open(this.src)
  }

  private notify(): void {
    this.listeners.forEach(listener => listener())
  }

  private open(src: string): void {
    this.handle?.destroy()
    this.status = 'loading'
    this.message = ''
    this.handle = getPlatform().createAudio(src)
    this.handle.setVolume(this.volume)
    this.handle.setLoop(this.loop)
    this.handle.onCanPlay(() => {
      if (this.status === 'loading') {
        this.status = 'paused'
        this.notify()
      }
    })
    this.handle.onEnded(() => {
      if (!this.loop) {
        this.status = 'ended'
        this.notify()
      }
    })
    this.handle.onError(message => {
      this.status = 'error'
      this.message = message
      this.notify()
    })
    this.notify()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  get currentTime(): number {
    return this.handle?.currentTime ?? 0
  }

  get duration(): number {
    return this.handle?.duration ?? 0
  }

  get playerStatus(): PlayerStatus {
    return this.status
  }

  get errorMessage(): string {
    return this.message
  }

  get isPlaying(): boolean {
    return this.status === 'playing'
  }

  get currentVolume(): number {
    return this.volume
  }

  get isLooping(): boolean {
    return this.loop
  }

  load(src: string): void {
    this.src = src
    this.open(src)
  }

  get source(): string {
    return this.src
  }

  play(): void {
    if (!this.handle) return
    if (this.status === 'ended') this.handle.seek(0)
    this.handle.play()
    this.status = 'playing'
    this.notify()
  }

  pause(): void {
    if (!this.handle) return
    this.handle.pause()
    this.status = 'paused'
    this.notify()
  }

  toggle(): void {
    if (this.isPlaying) this.pause()
    else this.play()
  }

  stop(): void {
    if (!this.handle) return
    this.handle.stop()
    this.status = 'paused'
    this.notify()
  }

  seek(time: number): void {
    this.handle?.seek(time)
    if (this.status === 'ended') this.status = 'paused'
    this.notify()
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.handle?.setVolume(this.volume)
    this.notify()
  }

  setLoop(loop: boolean): void {
    this.loop = loop
    this.handle?.setLoop(loop)
    this.notify()
  }

  destroy(): void {
    this.handle?.destroy()
    this.handle = null
    this.listeners.clear()
  }
}
