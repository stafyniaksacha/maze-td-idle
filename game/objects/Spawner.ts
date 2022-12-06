import { Enemy, BasicEnemy } from "./enemies"
import { GameObject } from "./GameObject"
import { Scene } from "./Scene"

import { state } from '../store'

export class Spawner extends GameObject {
  waveStartedAt: number = 0

  spawnedAt: number = 0
  spawnDelay: number = 1000

  get enemies () {
    return this.childrenOfType(Enemy)
  }

  get scene () {
    return this.parentOfType(Scene)
  }


  startWave () {
    if (state.wave.started) return

    state.wave.started = true
    state.wave.enemiesSpawned = 0
    this.waveStartedAt = performance.now()
    this.spawnedAt = 0
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!state.wave.started) return
    const now = performance.now()
    if (now - this.spawnedAt < this.spawnDelay) return

    this.spawnedAt = now

    const spawnerTiles = this.scene?.grid?.spawnerTiles
    if (!spawnerTiles) return 
    const inWorldSpawners = spawnerTiles.filter(tile => tile.isInWorld)

    if (state.wave.enemiesSpawned >= state.wave.current * inWorldSpawners.length) return

    for (const tile of inWorldSpawners) {
      const enemy = new BasicEnemy()
      enemy.centerX = tile.centerX
      enemy.centerY = tile.centerY

      enemy.onArrived = () => {
        state.wave.enemiesAlives--
        enemy.remove()

        if (!state.wave.enemiesAlives) {
          state.wave.started = false
          state.wave.current++
        }
      }

      state.wave.enemiesAlives++
      state.wave.enemiesSpawned++
      this.addChild(enemy)
    }
  }
}
