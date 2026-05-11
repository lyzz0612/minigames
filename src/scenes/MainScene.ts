import { Scene } from '../core/Scene'
import { World } from '../core/World'
import { Entity } from '../core/Entity'
import { TransformComponent } from '../components/TransformComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { MovementSystem } from '../systems/MovementSystem'

export class MainScene extends Scene {
  constructor() {
    super('MainScene')
  }

  init(): void {
    console.log('Initializing MainScene')
    
    this.world.addSystem(new MovementSystem())

    const player = this.world.createEntity('player')
    player.addComponent(new TransformComponent(100, 100))
    player.addComponent(new VelocityComponent(50, 50))
  }

  update(deltaTime: number): void {
    console.log(`MainScene updating with delta: ${deltaTime}`)
  }

  render(): void {
    console.log('MainScene rendering')
  }
}
