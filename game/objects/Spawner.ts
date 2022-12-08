import { state } from '../store'
import { Enemy, BasicEnemy } from './enemies'
import { GameObject } from './GameObject'
import { Scene } from './Scene'

import { doesCirclesCollide, findNearestCircle } from '~~/game/utils'

export class Spawner extends GameObject {
  waveStartedAt = 0

  spawnedAt = 0
  spawnDelay = 1000

  get enemies () {
    return this.childrenOfType(Enemy)
  }

  get scene () {
    return this.parentOfType(Scene)
  }

  findEnemiesOfTypeInRange<T extends Enemy = Enemy> (centerX: number, centerY: number, radius: number, type: new () => T) {
    const from = { centerX, centerY, radius }
    const enemies = this.childrenOfType(type)
    return enemies.filter(enemy => doesCirclesCollide(from, enemy))
  }

  findNearestEnemyOfTypeInRange<T extends Enemy = Enemy> (centerX: number, centerY: number, radius: number, type: new () => T) {
    const from = { centerX, centerY, radius }
    const enemies = this.findEnemiesOfTypeInRange(centerX, centerY, radius, type)
    return findNearestCircle(from, enemies)
  }

  startWave () {
    if (state.wave.started) { return }
    const spawnerTiles = this.scene?.grid?.spawnerTiles
    if (!spawnerTiles) { return }
    const inWorldSpawners = spawnerTiles.filter(tile => tile.isInWorld)

    this.waveStartedAt = performance.now()
    this.spawnedAt = 0

    state.wave.enemiesRemaining = state.wave.current * inWorldSpawners.length
    state.wave.enemiesSpawned = 0
    state.wave.started = true
  }

  looseWave () {
    this.enemies.forEach(enemy => enemy.remove())
    state.health = 10
    state.currency = 10
    state.wave = { started: false, current: 1, enemiesRemaining: 0, enemiesAlives: 0, enemiesSpawned: 0 }
    state.buildings = []
  }

  update (deltaTime: number): void {
    super.update(deltaTime)
    if (!state.wave.started) { return }
    const now = performance.now()
    if (now - this.spawnedAt < this.spawnDelay) { return }

    this.spawnedAt = now

    if (state.wave.enemiesRemaining <= 0) { return }

    const spawnerTiles = this.scene?.grid?.spawnerTiles
    if (!spawnerTiles) { return }
    const inWorldSpawners = spawnerTiles.filter(tile => tile.isInWorld)

    for (const tile of inWorldSpawners) {
      const enemy = new BasicEnemy()
      enemy.centerX = tile.centerX
      enemy.centerY = tile.centerY

      enemy.onDeath = () => {
        enemy.onDeath = undefined
        state.wave.enemiesAlives--

        state.currency += enemy.currencyOnKill

        if (!state.wave.enemiesAlives && !state.wave.enemiesRemaining) {
          state.wave.started = false
          state.wave.current++
        }
      }

      enemy.onArrived = () => {
        enemy.onArrived = undefined
        state.wave.enemiesAlives--

        state.health -= enemy.healthDamage
        if (state.health < 0) {
          this.looseWave()
          return
        }

        if (!state.wave.enemiesAlives && !state.wave.enemiesRemaining) {
          state.wave.started = false
          state.wave.current++
        }
      }

      state.wave.enemiesAlives++
      state.wave.enemiesSpawned++
      state.wave.enemiesRemaining--
      this.addChild(enemy)
    }
  }
}
