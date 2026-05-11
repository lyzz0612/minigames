import { Component } from '../core/Component'

export class SpriteComponent extends Component {
  public texture: string = ''
  public width: number = 32
  public height: number = 32
  public visible: boolean = true

  constructor(texture: string, width: number = 32, height: number = 32) {
    super()
    this.texture = texture
    this.width = width
    this.height = height
  }
}
