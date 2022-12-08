import { Tile } from '../objects'

function heuristicCostEstimate (a: Tile, b: Tile) {
  return Math.abs(a.indexX - b.indexX) + Math.abs(a.indexY - b.indexY) + a.walkCost + b.walkCost
}

function reconstructPath (cameFrom: WeakMap<Tile, Tile>, current: Tile) {
  const totalPath = [current]
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!
    totalPath.unshift(current)
  }
  return totalPath
}

function getNeighbors (current: Tile, maxX: number, maxY: number) {
  const grid = current?.grid
  if (!grid) { return [] }

  const neighbors = [] as Tile[]
  const { indexX, indexY } = current

  if (indexX > 0) {
    neighbors.push(grid.tilesmap[indexX - 1][indexY])
  }
  if (indexX < maxX) {
    neighbors.push(grid.tilesmap[indexX + 1][indexY])
  }
  if (indexY > 0) {
    neighbors.push(grid.tilesmap[indexX][indexY - 1])
  }
  if (indexY < maxY) {
    neighbors.push(grid.tilesmap[indexX][indexY + 1])
  }

  return neighbors
}

export function getAStarPath (start: Tile, goal: Tile, maxX: number, maxY: number) {
  const openSet = new Set<Tile>()
  openSet.add(start)

  const cameFrom = new WeakMap<Tile, Tile>()

  const gScore = new WeakMap<Tile, number>()
  const fScore = new WeakMap<Tile, number>()

  gScore.set(start, 0)
  fScore.set(start, heuristicCostEstimate(start, goal))

  while (openSet.size) {
    let current: Tile | undefined
    let currentFScore = Number.POSITIVE_INFINITY

    for (const tile of openSet) {
      const tileFScore = fScore.get(tile) ?? Number.POSITIVE_INFINITY
      if (tileFScore < currentFScore) {
        current = tile
        currentFScore = tileFScore
      }
    }

    if (!current) {
      return []
    }

    if (current === goal) {
      return reconstructPath(cameFrom, current)
    }

    openSet.delete(current)

    const neighbors = getNeighbors(current, maxX, maxY)

    for (const neighbor of neighbors) {
      if (!neighbor.canWalk) { continue }

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
