import { Scene } from './Scene'
import { World } from './World'

export class SceneManager {
  private scenes: Map<string, Scene> = new Map()
  private currentScene: Scene | null = null
  private world: World

  constructor() {
    this.world = new World()
  }

  addScene(scene: Scene): void {
    this.scenes.set(scene.name, scene)
  }

  loadScene(name: string): void {
    const scene = this.scenes.get(name)
    if (!scene) {
      console.error(`Scene ${name} not found`)
      return
    }

    if (this.currentScene) {
      this.currentScene.onExit()
    }

    this.currentScene = scene
    this.world = new World()
    scene.world = this.world
    scene.init()
    scene.onEnter()
  }

  update(deltaTime: number): void {
    if (this.currentScene) {
      this.world.update(deltaTime)
      this.currentScene.update(deltaTime)
    }
  }

  render(): void {
    if (this.currentScene) {
      this.currentScene.render()
    }
  }
}
