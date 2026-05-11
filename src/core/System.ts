import { Entity } from './Entity'
import { Component } from './Component'

export abstract class System {
  public priority: number = 0
  protected entities: Set<Entity> = new Set()

  abstract update(deltaTime: number): void

  registerEntity(entity: Entity): void {
    if (this.shouldRegister(entity)) {
      this.entities.add(entity)
    }
  }

  unregisterEntity(entity: Entity): void {
    this.entities.delete(entity)
  }

  protected shouldRegister(entity: Entity): boolean {
    return true
  }
}
