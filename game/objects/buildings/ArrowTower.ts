import { Enemy } from '../enemies/Enemy'

import { GameObject } from '../GameObject'

// import { state } from '../../store'
import { BuildingAttacker } from './BuildingAttacker'
import { LAYERS } from '~~/game/layers'

class ArrowBullet extends GameObject {
  layer: LAYERS = LAYERS.BULLETS
  centerX: number
  centerY: number
  radius = 2
  speed = 1
  target: Enemy | undefined = undefined

  onHit: (() => void) | undefined = undefined

  constructor (centerX: number, centerY: number) {
    super()
    this.centerX = centerX
    this.centerY = centerY
  }

  isAtTarget () {
    if (!this.target) { return false }
    return Math.round(this.centerX) === Math.round(this.target?.centerX) && Math.round(this.centerY) === Math.round(this.target?.centerY)
  }

  update (deltaTime: number): void {
    super.update(deltaTime)
    if (!this.target?.isAlive) {
      this.target = undefined
      this.remove()
      return
    }

    if (this.isAtTarget()) {
      this.onHit?.()
      this.target = undefined
      this.remove()
    } else if (this.target) {
      // move toward target
      if (this.centerX < this.target?.centerX) { this.centerX += this.speed } else if (this.centerX >= this.target?.centerX) { this.centerX -= this.speed }

      if (this.centerY <= this.target?.centerY) { this.centerY += this.speed } else if (this.centerY > this.target?.centerY) { this.centerY -= this.speed }
    }
  }

  draw (ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'red'
    ctx.fill()
    ctx.restore()
  }
}

export class ArrowTower extends BuildingAttacker {
  attackBullet: ArrowBullet | undefined = undefined
  attackTargetSelectionMode: 'nearest' | 'closest-to-goal' = 'closest-to-goal'
  attackTarget: Enemy | undefined = undefined
  attackRange = 70
  attackDamage = 0.5
  attackSpeed = 500
  attackedAt = 0
  buildingCost = 10

  attack (): void {
    const tile = this.tile
    if (!tile) { return }

    if (this.attackTarget?.isAlive) {
      // draw rect cannon
      const directionX = this.attackTarget.centerX - tile.centerX
      const directionY = this.attackTarget.centerY - tile.centerY
      const angle = Math.atan2(directionY, directionX)

      // add canon length to the bullet spawn position
      const canonLength = 12
      const bulletSpawnX = tile.centerX + canonLength * Math.cos(angle)
      const bulletSpawnY = tile.centerY + canonLength * Math.sin(angle)

      const bullet = new ArrowBullet(bulletSpawnX, bulletSpawnY)
      bullet.target = this.attackTarget
      bullet.onHit = () => {
        bullet.onHit = undefined
        this.attackTarget?.takeDamage(this.attackDamage)
        bullet.remove()
      }
      this.addChild(bullet)
    }
  }

  draw (ctx: CanvasRenderingContext2D): void {
    super.draw(ctx)

    const tile = this.tile
    if (!tile) { return }

    // draw rounded base
    ctx.beginPath()
    ctx.arc(tile.centerX, tile.centerY, 10, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'orange'
    ctx.fill()
    ctx.restore()

    // draw rect cannon
    const target = {
      centerX: this.attackTarget ? this.attackTarget.centerX : 0,
      centerY: this.attackTarget ? this.attackTarget.centerY : 0,
    }

    const directionX = target.centerX - tile.centerX
    const directionY = target.centerY - tile.centerY

    const angle = this.attackTarget ? Math.atan2(directionY, directionX) : 90 * Math.PI / 180

    ctx.beginPath()

    ctx.translate(tile.centerX, tile.centerY)
    ctx.rotate(angle)
    ctx.translate(-tile.centerX, -tile.centerY)

    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(tile.centerX, tile.centerY - 1, 12, 2) // canonLength = 12
    ctx.restore()

    ctx.resetTransform()
  }
}
