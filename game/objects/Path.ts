import { getAStarPath } from '../utils'
import { Tile, TileSpawner } from './tiles'
import { GameObject } from './GameObject'
import { Scene } from './Scene'

export class Path extends GameObject {
  waypoints = new Map<TileSpawner, Tile[]>()

  get scene () {
    return this.parentOfType(Scene)
  }

  init () {
    this.computePath()
    super.init()
  }

  computePath () {
    const scene = this.scene
    const grid = scene?.grid
    if (!grid || !scene) { return }

    const spawnerTiles = grid?.spawnerTiles
    if (!spawnerTiles?.length) { return }

    const goalTile = grid?.goalTile
    if (!goalTile) { return }

    this.waypoints.clear()
    for (const tile of spawnerTiles) {
      const path = getAStarPath(tile, goalTile, grid.cols - 1, grid.rows - 1)
      if (path.length === 0) { continue }

      this.waypoints.set(tile, path)
    }
  }

  draw (ctx: CanvasRenderingContext2D): void {
    if (!this.waypoints.size) { return }

    // draw magenta dashed line from first to last tile, passing through the middle tiles

    for (const [, path] of this.waypoints) {
      if (!path.length) { continue }

      ctx.beginPath()
      ctx.moveTo(path[0].cornerX + path[0].width / 2, path[0].cornerY + path[0].height / 2)
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].cornerX + path[i].width / 2, path[i].cornerY + path[i].height / 2)
      }

      ctx.save()
      ctx.strokeStyle = 'magenta'
      ctx.lineWidth = 3
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.restore()
    }
  }
}
