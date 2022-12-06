export abstract class GameObject {
  children: GameObject[] = []
  #parent: GameObject | undefined = undefined
  type: string

  // get children() {
  //   return this.#children
  // }

  get parent() {
    return this.#parent
  }

  constructor(children?: GameObject[]) {
    this.type = this.constructor.name
    this.children = children?.map((child) => {
      child.#parent = this
      return child
    }) ?? []
  }

  init() {
    this.children.forEach((child) => child.init())
  }

  drawTree(ctx: CanvasRenderingContext2D) {
    this.draw(ctx)

    this.children.forEach((child) => child.drawTree(ctx))

    this.postdraw(ctx)
  }

  childrenOfType<T extends GameObject>(type: new (...args: any[]) => T): T[] {
    return this.children.filter((child) => child instanceof type) as T[]
  }

  childOfType<T extends GameObject>(type: new (...args: any[]) => T): T | undefined {
    return this.children.find((child) => child instanceof type) as T ?? undefined
  }

  parentOfType<T extends GameObject>(type: new (...args: any[]) => T): T | undefined {
    if (!this.#parent) return undefined
    return this.#parent instanceof type ? this.#parent as T : this.#parent.parentOfType(type)
  }

  removeChild<T extends GameObject>(child?: T | undefined) {
    if (!child) return
    this.children = this.children.filter((c) => c !== child)
  }

  remove() {
    if (this.#parent) {
      this.#parent.removeChild(this)
    }
  }

  addChild<T extends GameObject>(child: T) {
    if (!this.children.includes(child)) {
      child.#parent = this
      this.children.push(child)
    }
  }

  // toString() {
  //   return `[instanceof ${this.constructor.name}]`
  // }

  postdraw(ctx: CanvasRenderingContext2D) {}
  draw(ctx: CanvasRenderingContext2D) {}
}
