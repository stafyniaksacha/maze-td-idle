import { Path, Building } from '../objects'
import { getTileAtIndex, getTileAtPos } from '../utils'
import { state } from '.'

export function toggleCanWalk () {
  if (!state.selectedTile) { return }
  if (!state.scene) { return }
  const path = state.scene.childOfType(Path)
  const tile = getTileAtIndex(state.selectedTile.indexX, state.selectedTile.indexY)
  if (!tile) { return }
  if (!tile.canBuild) { return }

  tile.canWalk = !tile.canWalk
  path?.computePath()
}

export function startWave () {
  if (!state.scene) { return }
  state.scene.spawner?.startWave()
}

export function removeBuilding () {
  if (!state.selectedTile) { return }
  if (!state.scene) { return }
  const tile = getTileAtIndex(state.selectedTile.indexX, state.selectedTile.indexY)
  if (!tile?.addBuilding) { return }

  try {
    const building = tile.building

    if (building) {
      tile.removeBuilding()
      state.scene.path?.computePath()
      delete state.buildings?.[state.selectedTile.indexX]?.[state.selectedTile.indexY]
      state.currency += building.buildingCost
    }
  } catch (error) {
    console.log('cannot remove building')
    console.log(error)
  }
}

export function tryAddBuildingToSelection<T extends Building> (building: T) {
  if (!state.selectedTile) { return }
  if (!state.scene) { return }
  const tile = getTileAtIndex(state.selectedTile.indexX, state.selectedTile.indexY)
  if (!tile) { return }

  try {
    if (building.buildingCost > state.currency) {
      throw new Error('Not enough currency')
    }

    if (!building.blockPath) {
      tile.addBuilding(building)
    } else {
      const spawnerTiles = state.scene.grid?.spawnerTiles
      const path = state.scene.path
      const tile = getTileAtIndex(state.selectedTile.indexX, state.selectedTile.indexY)
      if (!tile) { return }
      if (!spawnerTiles) { return }

      tile.addBuilding(building)
      state.scene.path?.computePath()

      if (!path?.waypoints?.size || path?.waypoints?.size !== spawnerTiles.length) {
        tile.removeBuilding()
        state.scene.path?.computePath()
        throw new Error('Path is blocked')
      }
    }

    state.currency -= building.buildingCost
    state.buildings[state.selectedTile.indexX] ??= []
    state.buildings[state.selectedTile.indexX][state.selectedTile.indexY] = { name: building.type }
  } catch (error) {
    console.log(`cannot build ${building.type}`)
    console.log(error)
  }
}

// export function buildFireTrap () {
//   if (!state.selectedTile) { return }
//   if (!state.scene) { return }
//   const tile = getTileAtIndex(state.selectedTile.indexX, state.selectedTile.indexY)
//   if (!tile) { return }

//   try {
//     tile.addBuilding(new FireTrap())

//     state.buildings[state.selectedTile.indexX] ??= []
//     state.buildings[state.selectedTile.indexX][state.selectedTile.indexY] = { name: 'FireTrap' }
//   } catch (error) {
//     console.log('cannot build FireTrap')
//     console.log(error)
//   }
// }
// export function buildArrowTower () {
//   if (!state.selectedTile) { return }
//   if (!state.scene) { return }
//   const spawnerTiles = state.scene.grid?.spawnerTiles
//   const path = state.scene.path
//   const tile = getTileAtIndex(state.selectedTile.indexX, state.selectedTile.indexY)
//   if (!tile) { return }
//   if (!spawnerTiles) { return }

//   try {
//     tile.addBuilding(new ArrowTower())
//     state.scene.path?.computePath()

//     if (!path?.waypoints?.size || path?.waypoints?.size !== spawnerTiles.length) {
//       tile.removeBuilding()
//       state.scene.path?.computePath()
//       throw new Error('Path is blocked')
//     }

//     state.buildings[state.selectedTile.indexX] ??= []
//     state.buildings[state.selectedTile.indexX][state.selectedTile.indexY] = { name: 'ArrowTower' }
//   } catch (error) {
//     console.log('cannot build ArrowTower')
//     console.log(error)
//   }
// }

export function selectTile (event: MouseEvent) {
  const tile = getTileAtPos(event.offsetX, event.offsetY)

  if (tile) {
    state.selectedTile = {
      indexX: tile?.indexX,
      indexY: tile?.indexY,
      tile: markRaw(tile),
    }
  } else {
    state.selectedTile = null
  }
}
