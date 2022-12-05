import { Cell } from "./Cell"
import { GameObject } from "./GameObject"
import { Grid } from "./Grid"
import { Scene } from "./Scene"

import { getAStarPath } from "../utils"

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
