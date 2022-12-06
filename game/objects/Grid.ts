import { Tile, TileSpawner, TileGoal } from "./tiles"
import { GameObject } from "./GameObject"
import { Scene } from "./Scene"

import { state } from '../store'
import { ArrowTower } from "./buildings"

export class Grid extends GameObject {
  gridOffsetX: number
  gridOffsetY: number

  tileSize: number
  width: number
  height: number
  rows: number
  cols: number
  #tilesmap: Tile[][] = []

  get tilesmap () {
    return this.#tilesmap
  }
  get tiles () {
    return this.childrenOfType(Tile) ?? []
  }
  get spawnerTiles () {
    return this.childrenOfType(TileSpawner) ?? []
  }
  get goalTile () {
    return this.childOfType(TileGoal)
  }

  
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

  reset() {
    this.#tilesmap.splice(0, this.#tilesmap.length)

    const tiles = this.tiles
    for (const child of tiles) {
      this.removeChild(child)
    }
  }

  init() {
    const scene = this.parentOfType(Scene)
    if (!scene) return

    this.reset()

    // build tilesmap
    for (let x = 0; x < this.cols; x++) {
      this.#tilesmap[x] = [] as Tile[]
      const rowOdd = x % 2 === 0

      for (let y = 0; y < this.rows; y++) {
        const lineOdd = y % 2 === 0

        if (x === 0 && y === 0 || (this.cols > 7 && x === 7 && y === 1)) {
          this.#tilesmap[x][y] = new TileSpawner({
            indexX: x,
            indexY: y,
            cornerX: this.gridOffsetX + x * this.tileSize,
            cornerY: this.gridOffsetY + y * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            canBuild: false,
            isOdd: rowOdd === lineOdd,
          })
        } else if (x === this.cols - 1 && y === this.rows - 1) {
          this.#tilesmap[x][y] = new TileGoal({
            indexX: x,
            indexY: y,
            cornerX: this.gridOffsetX + x * this.tileSize,
            cornerY: this.gridOffsetY + y * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            canBuild: false,
            isOdd: rowOdd === lineOdd,
          })
        } else {
          this.#tilesmap[x][y] = new Tile({
            indexX: x,
            indexY: y,
            cornerX: this.gridOffsetX + x * this.tileSize,
            cornerY: this.gridOffsetY + y * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            isOdd: rowOdd === lineOdd,
          })
          const buldingInfo = state.buildings?.[x]?.[y]
          if (buldingInfo) {
            this.#tilesmap[x][y].addBuilding(new ArrowTower())
          }
        }

        this.addChild(this.#tilesmap[x][y])
      }
    }
    
    super.init()
  }
}