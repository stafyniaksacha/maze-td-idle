import { Enemy } from '../enemies'
// import { GameObject } from '../GameObject'
import { Scene } from '../Scene'
import { Building } from './Building'

import { isTileSelected, doesCirclesCollide, findNearestCircle } from '~~/game/utils'

export abstract class BuildingAttacker extends Building {
  // abstract attackBullet: GameObject | undefined
  abstract attackTargetSelectionMode: 'nearest' | 'closest-to-goal'
  abstract attackTarget: Enemy | undefined
  abstract attackRange: number
  abstract attackDamage: number
  abstract attackSpeed: number
  abstract attackedAt: number

  findPreferredTarget (): Enemy | undefined {
    const tile = this.tile
    if (!tile) { return }

    const scene = this.parentOfType(Scene)
    if (!scene) { return }

    const from = { centerX: tile.centerX, centerY: tile.centerY, radius: this.attackRange }

    const enemies = scene?.spawner?.findEnemiesOfTypeInRange(tile.centerX, tile.centerY, this.attackRange, Enemy) ?? []
    if (enemies.length) {
      if (this.attackTargetSelectionMode === 'closest-to-goal') {
        const goalTile = tile.grid?.goalTile
        if (!goalTile) { return }

        const closestToGoal = findNearestCircle(goalTile, enemies)
        if (closestToGoal) {
          return closestToGoal
        }
      } else if (this.attackTargetSelectionMode === 'nearest') {
        const nearest = findNearestCircle(from, enemies)
        if (nearest) {
          return nearest
        }
      } else {
        console.error('unknown attackTargetSelectionMode', this.attackTargetSelectionMode)
      }
    }
  }

  update (deltaTime: number): void {
    super.update(deltaTime)

    const tile = this.tile
    if (!tile) {
      return
    }

    const now = performance.now()
    if (this.attackTarget && !this.attackTarget.isAlive) {
      // unfocus, target is dead
      this.attackTarget = undefined
    }

    const from = { centerX: tile.centerX, centerY: tile.centerY, radius: this.attackRange }
    if (this.attackTarget && !doesCirclesCollide(this.attackTarget, from)) {
      // unfocus, target is out of range
      this.attackTarget = undefined
    }

    if (!this.attackTarget) {
      this.attackTarget = this.findPreferredTarget()
    }

    if (this.attackTarget) {
      if (now - this.attackedAt > this.attackSpeed) {
        this.attackedAt = now
        this.attack()
      }
    }
  }

  attack (): void {
    if (this.attackTarget) {
      this.attackTarget.takeDamage(this.attackDamage)
    }
  }

  draw (ctx: CanvasRenderingContext2D): void {
    const tile = this.tile
    if (!tile) { return }
    if (!isTileSelected(tile)) { return }

    ctx.beginPath()
    ctx.arc(tile.centerX, tile.centerY, this.attackRange, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0, 255, 0, 1)'
    ctx.stroke()
    ctx.restore()
  }
}
