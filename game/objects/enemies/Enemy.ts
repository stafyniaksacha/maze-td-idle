import { getAStarPath, getTileAtPos } from "../../utils"
import { Tile } from "../tiles"
import { GameObject } from "../GameObject"
import { Scene } from "../Scene"

/**
 * @virtual See {@link isArrived| the WarningStyle enum}
 */
export class Enemy extends GameObject {
  centerX: number = 0
  centerY: number = 0
  target: Tile | null = null
  speed: number = 0.4
  health: number = 4
  isAlive: boolean = true
  isArrived: boolean = false
  onDeath: () => void = () => {}
  onArrived: () => void = () => {}

  // onDeath () {
  //   this.isArrived = false
  //   this.isAlive = false
  //   // this.remove()
  // }
  // onArrived () {
  //   this.isArrived = true
  //   this.isAlive = false
  //   // this.remove()
  // }

  isAtTarget () {
    if (!this.target) return false
    return Math.round(this.centerX) === Math.round(this.target?.centerX) && Math.round(this.centerY) === Math.round(this.target?.centerY)
  }

  findTarget (): Tile | null {
    const currentTile = getTileAtPos(this.centerX, this.centerY)
    const goalTile = this.parentOfType(Scene)?.grid?.goalTile
    if (!currentTile || !goalTile) return null
    if (currentTile === goalTile) return null

    const path = getAStarPath(currentTile, goalTile)
    return path[1]
  }

  update (deltaTime: number): void {
    super.update(deltaTime)
    if (!this.isAlive) return
    if (!this.target || this.isAtTarget()) {
      const nextTarget = this.findTarget()
      if (!nextTarget) {
        this.onArrived?.()
        this.isArrived = true
        this.isAlive = false
        this.target = null
        return
      }

      this.target = nextTarget
    } else if (this.target) {
      // move toward target
      if (this.centerX < this.target?.centerX) this.centerX += this.speed
      else if (this.centerX >= this.target?.centerX) this.centerX -= this.speed

      if (this.centerY <= this.target?.centerY) this.centerY += this.speed
      else if (this.centerY > this.target?.centerY) this.centerY -= this.speed
    }
  }
}
