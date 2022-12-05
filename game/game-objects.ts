import { state } from './state'
import { getAStarPath } from './astar'

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

export class Grid extends GameObject {
  grid: Cell[][] = []

  reset() {
    this.grid.splice(0, this.grid.length)

    const cells = this.childrenOfType(Cell)
    for (const child of cells) {
      this.removeChild(child)
    }
  }

  init() {
    const scene = this.parentOfType(Scene)
    if (!scene) return

    this.reset()

    // add grid cells
    for (let x = 0; x < scene.cols; x++) {
      this.grid[x] = [] as Cell[]
      const rowOdd = x % 2 === 0

      for (let y = 0; y < scene.rows; y++) {
        const lineOdd = y % 2 === 0

        this.grid[x][y] = new Cell({
          indexX: x,
          indexY: y,
          cellX: scene.gridOffsetX + x * scene.tileSize,
          cellY: scene.gridOffsetY + y * scene.tileSize,
          cellWidth: scene.tileSize,
          cellHeight: scene.tileSize
        })

        if (x === 0 && y === 0) {
          // this.grid[x][y].isSpawn = true
          this.grid[x][y].canBuild = false
        } else if (x === scene.cols - 1 && y === scene.rows - 1) {
          // this.grid[x][y].isGoal = true
          this.grid[x][y].canBuild = false
        }

        if (rowOdd === lineOdd) {
          this.grid[x][y].isOdd = true
        }

        this.addChild(this.grid[x][y])
      }
    }
  }
}

export class Scene extends GameObject {
  // grid: Cell[][] = []
  // cells: Cell[] = []
  // path: Cell[] = []

  gridOffsetX: number
  gridOffsetY: number

  rows: number
  cols: number
  tileSize: number
  width: number
  height: number

  constructor(props: {
    rows: number
    cols: number
    tileSize: number
    width: number
    height: number
  }) {
    super()
    this.rows = props.rows
    this.cols = props.cols
    this.tileSize = props.tileSize
    this.width = props.width
    this.height = props.height

    const gridWidth = this.cols * this.tileSize
    this.gridOffsetX = Math.floor((this.width - gridWidth) / 2)

    const gridHeight = this.rows * this.tileSize
    this.gridOffsetY = Math.floor((this.height - gridHeight) / 2)
  }

  // reset() {
  //   this.grid.splice(0, this.grid.length)

  //   const cells = this.childrenOfType(Cell)
  //   for (const child of cells) {
  //     this.removeChild(child)
  //   }
  // }

  init() {
    // this.reset()

    // // add grid cells
    // for (let x = 0; x < this.cols; x++) {
    //   this.grid[x] = [] as Cell[]
    //   const rowOdd = x % 2 === 0

    //   for (let y = 0; y < this.rows; y++) {
    //     const lineOdd = y % 2 === 0

    //     this.grid[x][y] = new Cell({
    //       indexX: x,
    //       indexY: y,
    //       cellX: this.gridOffsetX + x * this.tileSize,
    //       cellY: this.gridOffsetY + y * this.tileSize,
    //       cellWidth: this.tileSize,
    //       cellHeight: this.tileSize
    //     })

    //     if (x === 0 && y === 0) {
    //       this.grid[x][y].isSpawn = true
    //       this.grid[x][y].canBuild = false
    //     } else if (x === this.cols - 1 && y === this.rows - 1) {
    //       this.grid[x][y].isGoal = true
    //       this.grid[x][y].canBuild = false
    //     }

    //     if (rowOdd === lineOdd) {
    //       this.grid[x][y].isOdd = true
    //     }

    //     this.addChild(this.grid[x][y])
    //   }
    // }
    // update grid
    let _grid
    if ((_grid = this.childOfType(Grid))) {
      _grid.init()
    } else {
      const grid = new Grid()
      this.addChild(grid)
      grid.init()
    }

    // update path
    let _path
    if ((_path = this.childOfType(Path))) {
      _path.computePath()
    } else {
      const path = new Path()
      this.addChild(path)
      path.computePath()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // draw red circle on first cell
    ctx.save()
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(this.gridOffsetX + this.tileSize / 2, this.gridOffsetY + this.tileSize / 2, 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
    
    // draw green circle on last cell
    ctx.save()
    ctx.fillStyle = 'green'
    ctx.beginPath()
    ctx.arc(this.gridOffsetX + (this.cols - 0.5) * this.tileSize, this.gridOffsetY + (this.rows - 0.5) * this.tileSize, 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }
}

export class Path extends GameObject {
  path: Cell[] = []

  computePath() {
    const scene = this.parentOfType(Scene)
    if (!scene) return
    const grid = scene.childOfType(Grid)
    if (!grid) return

    const start = grid.grid[0][0] // top left cell
    const goal = grid.grid[scene.cols - 1][scene.rows - 1] // bottom right cell

    this.path.splice(0, this.path.length)
    this.path.push(...getAStarPath(start, goal))
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.path.length) return

    // draw magenta dashed line from first to last cell, passing through the middle cells

    ctx.save()
    ctx.strokeStyle = 'magenta'
    ctx.lineWidth = 3
    ctx.setLineDash([4, 4])

    ctx.beginPath()
    ctx.moveTo(this.path[0].cellX + this.path[0].cellWidth / 2, this.path[0].cellY + this.path[0].cellHeight / 2)
    for (let i = 1; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].cellX + this.path[i].cellWidth / 2, this.path[i].cellY + this.path[i].cellHeight / 2)
    }
    ctx.stroke()
    ctx.restore()
  }
}

export class Cell extends GameObject {
  indexX: number = 0
  indexY: number = 0
  cellX: number = 0
  cellY: number = 0
  cellWidth: number = 0
  cellHeight: number = 0
  canWalk: boolean = true
  canBuild: boolean = true
  // isSpawn: boolean = false
  // isGoal: boolean = false
  // isHover: boolean = false
  isOdd: boolean = false

  constructor(
    props: {
      indexX: number,
      indexY: number,
      cellX: number,
      cellY: number,
      cellWidth: number,
      cellHeight: number
    },
    children?: GameObject[]
  ) {
    super(children)
    this.indexX = props.indexX
    this.indexY = props.indexY
    this.cellX = props.cellX
    this.cellY = props.cellY
    this.cellWidth = props.cellWidth
    this.cellHeight = props.cellHeight
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scene = this.parentOfType(Scene)
    if (!scene) return

    // Draw debug grid
    if (!this.canWalk) {
      ctx.fillStyle = 'wheat'
    } else if (this.isOdd) {
      ctx.fillStyle = 'black'
    } else {
      ctx.fillStyle = 'white'
    }
    ctx.fillRect(this.cellX, this.cellY, scene.tileSize, scene.tileSize)

    // Draw hover
    let currentCellHover = false
    if (state.isHover) {
      if (state.mousePosition.x >= this.cellX && state.mousePosition.x <= this.cellX + this.cellWidth &&
        state.mousePosition.y >= this.cellY && state.mousePosition.y <= this.cellY + this.cellHeight) {
        currentCellHover = true
      }
    }
    if (currentCellHover) {
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 6
      ctx.strokeRect(this.cellX + 3, this.cellY + 3, scene.tileSize - 6, scene.tileSize - 6)
    } 

    // // Draw selection
    if (state.selectedCell?.indexX === this.indexX && state.selectedCell?.indexY === this.indexY) {
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 6
      ctx.strokeRect(this.cellX + 3, this.cellY + 3, scene.tileSize - 6, scene.tileSize - 6)
    } 
  }
}
