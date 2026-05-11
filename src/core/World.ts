import { Entity } from './Entity'
import { Component } from './Component'
import { System } from './System'

export class World {
  private entities: Map<string, Entity> = new Map()
  private systems: System[] = []

  createEntity(id?: string): Entity {
    const entity = new Entity(id)
    this.entities.set(entity.id, entity)
    this.onEntityCreated(entity)
    return entity
  }

  destroyEntity(entity: Entity): void {
    this.entities.delete(entity.id)
    this.onEntityDestroyed(entity)
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id)
  }

  addSystem(system: System): void {
    this.systems.push(system)
    this.systems.sort((a, b) => a.priority - b.priority)
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system)
    if (index !== -1) {
      this.systems.splice(index, 1)
    }
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(deltaTime)
    }
  }

  private onEntityCreated(entity: Entity): void {
    for (const system of this.systems) {
      system.registerEntity(entity)
    }
  }

  private onEntityDestroyed(entity: Entity): void {
    for (const system of this.systems) {
      system.unregisterEntity(entity)
    }
  }
}
