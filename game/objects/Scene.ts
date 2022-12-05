import { GameObject } from "./GameObject"
import { Grid } from "./Grid"
import { Path } from "./Path"

export class Scene extends GameObject {
  gridOffsetX: number
  gridOffsetY: number

  rows: number
  cols: number
  tileSize: number
  width: number
  height: number

  constructor(props?: {
    rows: number
    cols: number
    tileSize: number
    width: number
    height: number
  }) {
    super()
    this.rows = props?.rows ?? 1
    this.cols = props?.cols ?? 1
    this.tileSize = props?.tileSize ?? 1
    this.width = props?.width ?? 0
    this.height = props?.height ?? 0

    const gridWidth = this.cols * this.tileSize
    this.gridOffsetX = Math.floor((this.width - gridWidth) / 2)

    const gridHeight = this.rows * this.tileSize
    this.gridOffsetY = Math.floor((this.height - gridHeight) / 2)
  }

  async init() {
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
