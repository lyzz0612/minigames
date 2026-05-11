import { Component } from '../core/Component'

export class VelocityComponent extends Component {
  public vx: number = 0
  public vy: number = 0

  constructor(vx: number = 0, vy: number = 0) {
    super()
    this.vx = vx
    this.vy = vy
  }
}
