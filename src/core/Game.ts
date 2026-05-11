export class Game {
  private static instance: Game | null = null
  private isRunning: boolean = false
  private lastTime: number = 0

  private constructor() {}

  static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game()
    }
    return Game.instance
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.loop()
  }

  stop(): void {
    this.isRunning = false
  }

  private loop(): void {
    if (!this.isRunning) return
    
    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    requestAnimationFrame(() => this.loop())
  }

  update(deltaTime: number): void {
    console.log(`Updating with delta: ${deltaTime}`)
  }

  render(): void {
  }
}
