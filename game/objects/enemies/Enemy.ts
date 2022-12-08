import { getAStarPath, getTileAtPos } from '../../utils'
import { Tile } from '../tiles'
import { GameObject } from '../GameObject'
import { Scene } from '../Scene'

import { state } from '../../store'

/**
 * @virtual See {@link isArrived| the WarningStyle enum}
 */
export class Enemy extends GameObject {
  centerX = 0
  centerY = 0
  target: Tile | null = null
  radius = 1
  speed = 0.4
  damageTaken = 0
  baseHealth = 1
  currencyOnKill = 1
  healthDamage = 1
  isAlive = true
  isArrived = false
  onDeath: (() => void) | undefined = undefined
  onArrived: (() => void) | undefined = undefined

  get health () {
    return this.baseHealth + (this.baseHealth * 1.1 * (state.wave.current - 1) * 0.2)
  }

  takeDamage (damage: number) {
    this.damageTaken += damage
    if (this.damageTaken > this.health) {
      this.onDeath?.()
      this.isAlive = false
      this.isArrived = false
      this.remove()
    }
  }

  isAtTarget () {
    if (!this.target) { return false }
    return Math.round(this.centerX) === Math.round(this.target?.centerX) && Math.round(this.centerY) === Math.round(this.target?.centerY)
  }

  findTarget (): Tile | null {
    const currentTile = getTileAtPos(this.centerX, this.centerY)
    const grid = this.parentOfType(Scene)?.grid
    if (!grid) { return null }
    const goalTile = grid?.goalTile
    if (!currentTile || !goalTile) { return null }
    if (currentTile === goalTile) { return null }

    const path = getAStarPath(currentTile, goalTile, grid.cols - 1, grid.rows - 1)
    return path[1]
  }

  remove () {
    this.isAlive = false
    super.remove()
  }

  update (deltaTime: number): void {
    super.update(deltaTime)
    if (!this.isAlive) { return }
    if (!this.target || this.isAtTarget()) {
      const nextTarget = this.findTarget()
      if (!nextTarget) {
        this.onArrived?.()
        this.isArrived = true
        this.isAlive = false
        this.target = null
        this.remove()
        return
      }

      this.target = nextTarget
    } else if (this.target) {
      // move toward target
      if (this.centerX < this.target?.centerX) { this.centerX += this.speed } else if (this.centerX >= this.target?.centerX) { this.centerX -= this.speed }

      if (this.centerY <= this.target?.centerY) { this.centerY += this.speed } else if (this.centerY > this.target?.centerY) { this.centerY -= this.speed }
    }
  }
}
