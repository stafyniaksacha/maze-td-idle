import { Cell, Grid } from "./game-objects"
import { state } from "./state"

function heuristicCostEstimate(a: Cell, b: Cell) {
  return Math.abs(a.indexX - b.indexX) + Math.abs(a.indexY - b.indexY)
}

function reconstructPath(cameFrom: Map<Cell, Cell>, current: Cell) {
  const totalPath = [current]
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!
    totalPath.unshift(current)
  }
  return totalPath
}

function getNeighbors(current: Cell) {
  if (!state.scene) return []
  const grid = state.scene.childOfType(Grid)?.grid
  if (!grid) return []

  const neighbors = [] as Cell[]
  const { indexX, indexY } = current


  if (indexX > 0) {
    neighbors.push(grid[indexX - 1][indexY])
  }
  if (indexX < state.scene.cols - 1) {
    neighbors.push(grid[indexX + 1][indexY])
  }
  if (indexY > 0) {
    neighbors.push(grid[indexX][indexY - 1])
  }
  if (indexY < state.scene.rows - 1) {
    neighbors.push(grid[indexX][indexY + 1])
  }

  return neighbors
}

export function getAStarPath(start: Cell, goal: Cell) {
  const openSet = new Set<Cell>()
  openSet.add(start)

  const cameFrom = new Map<Cell, Cell>()

  const gScore = new Map<Cell, number>()
  const fScore = new Map<Cell, number>()

  gScore.set(start, 0)
  fScore.set(start, heuristicCostEstimate(start, goal))


  while (openSet.size) {
    let current: Cell | undefined
    let currentFScore = Number.POSITIVE_INFINITY

    for (const cell of openSet) {
      const cellFScore = fScore.get(cell) ?? Number.POSITIVE_INFINITY
      if (cellFScore < currentFScore) {
        current = cell
        currentFScore = cellFScore
      }
    }

    if (!current) {
      return []
    }

    if (current === goal) {
      return reconstructPath(cameFrom, current)
    }


    openSet.delete(current)

    const neighbors = getNeighbors(current)

    for (const neighbor of neighbors) {
      if (!neighbor.canWalk) continue

      const tentativeGScore = (gScore.get(current) ?? 0) + heuristicCostEstimate(current, neighbor)

      if (tentativeGScore >= (gScore.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
        continue
      }

      cameFrom.set(neighbor, current)
      gScore.set(neighbor, tentativeGScore)
      fScore.set(neighbor, tentativeGScore + heuristicCostEstimate(neighbor, goal))

      if (!openSet.has(neighbor)) {
        openSet.add(neighbor)
      }
    }
  }
  return []
}