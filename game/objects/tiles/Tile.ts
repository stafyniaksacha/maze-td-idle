import { Building } from "../buildings"
import { GameObject } from "../GameObject"

import { state } from '../../store'
import { Grid } from "../Grid"
import { LAYERS } from "../../layers"

export class Tile extends GameObject {
  layer: LAYERS = LAYERS.BACKGROUND

  indexX: number
  indexY: number
  cornerX: number
  cornerY: number
  width: number
  height: number
  walkCost: number = 1
  canWalk: boolean
  canBuild: boolean
  // isSpawn: boolean = false
  // isGoal: boolean = false
  // isHover: boolean = false
  isOdd: boolean

  get centerX () {
    return this.cornerX + this.width / 2
  }

  get centerY () {
    return this.cornerY + this.height / 2
  }

  get building() {
    return this.childOfType(Building)
  }
  get grid() {
    return this.parentOfType(Grid)
  }

  get isInWorld() {
    if (!this.grid) return false
    
    return this.cornerX >= 0 && this.cornerX <= this.grid?.width && this.cornerY >= 0 && this.cornerY <= this.grid?.height
  }

  constructor(
    props?: {
      indexX?: number,
      indexY?: number,
      cornerX?: number,
      cornerY?: number,
      width?: number,
      height?: number
      canWalk?: boolean
      canBuild?: boolean
      isOdd?: boolean
    },
    children?: GameObject[]
  ) {
    super(children)
    this.indexX = props?.indexX ?? 0
    this.indexY = props?.indexY ?? 0
    this.cornerX = props?.cornerX ?? 0
    this.cornerY = props?.cornerY ?? 0
    this.width = props?.width ?? 1
    this.height = props?.height ?? 1
    this.canWalk = props?.canWalk ?? true
    this.canBuild = props?.canBuild ?? true
    this.isOdd = props?.isOdd ?? false
  }

  addBuilding<T extends Building>(building: T) {
    if (!this.canBuild) {
      throw new Error('Bulding cannot be placed here')
    }

    if (this.building) {
      throw new Error('Tile already has a building')
    }

    this.addChild(building)

    if (building.blockPath) {
      this.canWalk = false
    }
  }
  removeBuilding() {
    this.removeChild(this.building)
    this.canWalk = true
  }

  draw(ctx: CanvasRenderingContext2D) {
    const grid = this.grid
    if (!grid) return

    // Draw debug grid
    ctx.save()
    if (!this.canWalk) {
      ctx.fillStyle = 'wheat'
    } else if (!this.canBuild) {
      ctx.fillStyle = 'burlywood'
    } else if (this.isOdd) {
      ctx.fillStyle = 'black'
    } else {
      ctx.fillStyle = 'white'
    }
    ctx.fillRect(this.cornerX, this.cornerY, grid.tileSize, grid.tileSize)
    ctx.restore()

    // Draw hover
    let currentTileHover = false
    if (state.isHover) {
      if (state.mousePosition.x >= this.cornerX && state.mousePosition.x <= this.cornerX + this.width &&
        state.mousePosition.y >= this.cornerY && state.mousePosition.y <= this.cornerY + this.height) {
        currentTileHover = true
      }
    }
    if (currentTileHover) {
      ctx.save()
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 6
      ctx.strokeRect(this.cornerX + 3, this.cornerY + 3, grid.tileSize - 6, grid.tileSize - 6)
      ctx.restore()
    } 

    // Draw selection
    if (state.selectedTile?.indexX === this.indexX && state.selectedTile?.indexY === this.indexY) {
      ctx.save()
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 6
      ctx.strokeRect(this.cornerX + 3, this.cornerY + 3, grid.tileSize - 6, grid.tileSize - 6)
      ctx.restore()
    }
  }
}
