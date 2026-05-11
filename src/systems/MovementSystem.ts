import { System } from '../core/System'
import { Entity } from '../core/Entity'
import { TransformComponent } from '../components/TransformComponent'
import { VelocityComponent } from '../components/VelocityComponent'

export class MovementSystem extends System {
  public priority = 10

  protected shouldRegister(entity: Entity): boolean {
    return entity.hasComponent(TransformComponent) && 
           entity.hasComponent(VelocityComponent)
  }

  update(deltaTime: number): void {
    for (const entity of this.entities) {
      const transform = entity.getComponent(TransformComponent)
      const velocity = entity.getComponent(VelocityComponent)

      if (transform && velocity) {
        transform.x += velocity.vx * deltaTime
        transform.y += velocity.vy * deltaTime
      }
    }
  }
}
