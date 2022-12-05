
import { Cell, Grid } from '../objects'
import { state } from '../store'

export function getCellAtPos(x: number, y: number) {
  if (!state.scene) return null
  const cells = state.scene.childOfType(Grid)?.childrenOfType(Cell)
  if (!cells) return null

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    if (x >= cell.cellX && x <= cell.cellX + cell.cellWidth &&
      y >= cell.cellY && y <= cell.cellY + cell.cellHeight) {
      return cell
    }
  }
  return null
}

export function getCellAtIndex(indexX: number, indexY: number) {
  if (!state.scene) return null
  const grid = state.scene.childOfType(Grid)
  if (!grid) return null

  return grid.grid[indexX][indexY]
}