import { Game } from './core/Game'
import { SceneManager } from './scenes/SceneManager'
import { MainScene } from './scenes/MainScene'

class MiniGame extends Game {
  private sceneManager: SceneManager

  constructor() {
    super()
    this.sceneManager = new SceneManager()
  }

  start(): void {
    this.sceneManager.addScene(new MainScene())
    this.sceneManager.loadScene('MainScene')
    
    super.start()
  }

  update(deltaTime: number): void {
    this.sceneManager.update(deltaTime)
  }

  render(): void {
    this.sceneManager.render()
  }
}

const game = MiniGame.getInstance()
game.start()
