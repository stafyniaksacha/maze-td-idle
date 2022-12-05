import { Building } from "./Building"
import { GameObject } from "./GameObject"
import { Scene } from "./Scene"

import { state } from '../store'

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
    props?: {
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
    this.indexX = props?.indexX ?? 0
    this.indexY = props?.indexY ?? 0
    this.cellX = props?.cellX ?? 0
    this.cellY = props?.cellY ?? 0
    this.cellWidth = props?.cellWidth ?? 1
    this.cellHeight = props?.cellHeight ?? 1
  }

  addBuilding<T extends Building>(building: T) {
    if (!this.canBuild) {
      throw new Error('Bulding cannot be placed here')
    }

    const currentBuliding = this.childOfType(Building)
    if (currentBuliding) {
      throw new Error('Cell already has a building')
    }

    this.addChild(building)
    // this.canBuild = false
    this.canWalk = false
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scene = this.parentOfType(Scene)
    if (!scene) return

    // Draw debug grid
    if (!this.canWalk) {
      ctx.fillStyle = 'wheat'
    } else if (!this.canBuild) {
      ctx.fillStyle = 'burlywood'
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
