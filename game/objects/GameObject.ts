export abstract class GameObject {
  protected children: GameObject[] = []
  protected parent: GameObject | null = null

  constructor(children?: GameObject[]) {
    this.children = children?.map((child) => {
      child.parent = this
      return child
    }) ?? []
  }

  drawTree(ctx: CanvasRenderingContext2D) {
    this.children.forEach((child) => child.drawTree(ctx))

    ctx.save()
    this.draw(ctx)
    ctx.restore()
  }

  childrenOfType<T extends GameObject>(type: new (...args: any[]) => T): T[] {
    return this.children.filter((child) => child instanceof type) as T[]
  }

  childOfType<T extends GameObject>(type: new (...args: any[]) => T): T | null {
    return this.children.find((child) => child instanceof type) as T ?? null
  }

  parentOfType<T extends GameObject>(type: new (...args: any[]) => T): T | null {
    if (this.parent === null) return null
    return this.parent instanceof type ? this.parent as T : this.parent.parentOfType(type)
  }

  removeChild<T extends GameObject>(child?: T | null) {
    if (!child) return
    this.children = this.children.filter((c) => c !== child)
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
  }

  addChild<T extends GameObject>(child: T) {
    if (!this.children.includes(child)) {
      child.parent = this
      this.children.push(child)
    }
  }

  toString() {
    return `[instanceof ${this.constructor.name}]`
  }

  draw(ctx: CanvasRenderingContext2D) {}
}
