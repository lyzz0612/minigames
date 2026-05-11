export abstract class Component {
  public entity: any = null

  init(...args: any[]): void {}

  update(deltaTime: number): void {}

  destroy(): void {}
}
