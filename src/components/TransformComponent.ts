import { Component } from '../core/Component'

export class TransformComponent extends Component {
  public x: number = 0
  public y: number = 0
  public scaleX: number = 1
  public scaleY: number = 1
  public rotation: number = 0

  constructor(x: number = 0, y: number = 0) {
    super()
    this.x = x
    this.y = y
  }
}
