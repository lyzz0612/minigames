import { System } from '../core/System'
import { Entity } from '../core/Entity'

export class RenderSystem extends System {
  public priority = 100

  protected shouldRegister(entity: Entity): boolean {
    return entity.hasComponent<any>('SpriteComponent')
  }

  update(_deltaTime: number): void {
    for (const entity of this.entities) {
      const sprite = entity.getComponent<any>('SpriteComponent')
      if (sprite && sprite.visible) {
        this.renderEntity(entity)
      }
    }
  }

  private renderEntity(entity: Entity): void {
    console.log(`Rendering entity: ${entity.id}`)
  }
}
