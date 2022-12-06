
import { Tile, Grid } from '../objects'
import { state } from '../store'

export function getTileAtPos(x: number, y: number): Tile | null {
  if (!state.scene) return null
  const tiles = state.scene.grid?.tiles
  if (!tiles) return null

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]
    if (x >= tile.cornerX && x <= tile.cornerX + tile.width &&
      y >= tile.cornerY && y <= tile.cornerY + tile.height) {
      return tile as Tile
    }
  }
  return null
}

export function getTileAtIndex(indexX: number, indexY: number): Tile | null {
  if (!state.scene) return null
  const grid = state.scene.grid
  if (!grid) return null

  return grid.tilesmap[indexX][indexY] as Tile
}

export function isTileSelected(tile?: Tile): boolean {
  if (!tile) return false
  if (!state.selectedTile) return false
  return state.selectedTile.indexX === tile.indexX && state.selectedTile.indexY === tile.indexY
}
