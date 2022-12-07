import { LAYERS } from "../layers"

/**
 * Main game object class
 */
export abstract class GameObject {
  #children: GameObject[] = []
  #parent: GameObject | undefined = undefined
  
  layer: LAYERS = LAYERS.DEFAULT
  type: string

  get children() {
    return this.#children
  }

  get parent() {
    return this.#parent
  }

  constructor(children?: GameObject[]) {
    this.type = this.constructor.name
    this.#children = children?.map((child) => {
      child.#parent = this
      return child
    }) ?? []
  }

  // tree (children/parents) accessors methods

  addChild<T extends GameObject>(child: T) {
    if (!this.#children.includes(child)) {
      child.#parent = this
      this.#children.push(child)
    }
  }

  removeChild<T extends GameObject>(child?: T | undefined) {
    if (!child) return
    this.#children = this.#children.filter((c) => c !== child)
  }

  remove() {
    if (this.#parent) {
      this.#parent.removeChild(this)
    }
  }

  childrenOfType<T extends GameObject>(type: new (...args: any[]) => T): T[] {
    return this.#children.filter((child) => child instanceof type) as T[]
  }

  childOfType<T extends GameObject>(type: new (...args: any[]) => T): T | undefined {
    return this.#children.find((child) => child instanceof type) as T ?? undefined
  }

  parentOfType<T extends GameObject>(type: new (...args: any[]) => T): T | undefined {
    if (!this.#parent) return undefined
    return this.#parent instanceof type ? this.#parent as T : this.#parent.parentOfType(type)
  }

  // lifecycle methods

  init() {
    this.#children.forEach((child) => child.init())
  }

  update(deltaTime: number) {
    this.#children.forEach((child) => child.update(deltaTime))
  }

  drawTree(ctx: CanvasRenderingContext2D, layer: LAYERS) {
    if (this.layer === layer) {
      this.draw(ctx)
    }
    this.#children.forEach((child) => child.drawTree(ctx, layer))
  }

  draw(ctx: CanvasRenderingContext2D) {}
}
