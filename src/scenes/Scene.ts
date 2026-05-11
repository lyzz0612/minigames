export abstract class Scene {
  public name: string
  protected world: any = null

  constructor(name: string) {
    this.name = name
  }

  abstract init(): void

  abstract update(deltaTime: number): void

  abstract render(): void

  onEnter(): void {}

  onExit(): void {}
}
