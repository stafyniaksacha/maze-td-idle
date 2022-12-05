import { Path } from './game-objects'
import { state } from './state'
import { getCellAtIndex, getCellAtPos } from './utils'

export function toggleCanWalk() {
  if (!state.selectedCell) return
  if (!state.scene) return
  const path = state.scene.childOfType(Path)
  const cell = getCellAtIndex(state.selectedCell.indexX, state.selectedCell.indexY)
  if (!cell) return

  cell.canWalk = !cell.canWalk
  path?.computePath()
}

export function selectCell(event: MouseEvent) {
  const cell = getCellAtPos(event.offsetX, event.offsetY)
  
  if (cell) {
    state.selectedCell = {
      indexX: cell?.indexX,
      indexY: cell?.indexY,
    }
  } else {
    state.selectedCell = null
  }
}