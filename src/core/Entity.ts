export class Entity {
  public id: string
  public active: boolean = true
  private components: Map<string, any> = new Map()

  constructor(id?: string) {
    this.id = id || `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  addComponent<T>(component: T): this {
    const name = component.constructor.name
    this.components.set(name, component)
    return this
  }

  getComponent<T>(componentClass: new (...args: any[]) => T): T | undefined {
    return this.components.get(componentClass.name)
  }

  hasComponent<T>(componentClass: new (...args: any[]) => T): boolean {
    return this.components.has(componentClass.name)
  }

  removeComponent<T>(componentClass: new (...args: any[]) => T): void {
    this.components.delete(componentClass.name)
  }
}
