import { Cell } from "./Cell"
import { GameObject } from "./GameObject"
import { Scene } from "./Scene"

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