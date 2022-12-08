import { Enemy } from '../enemies/Enemy'

import { GameObject } from '../GameObject'

import { state } from '../../store'
import { BuildingAttacker } from './BuildingAttacker'

class ArrowBullet extends GameObject {}

export class ArrowTower extends BuildingAttacker {
  attackBullet: ArrowBullet | null = null
  attackTarget: Enemy | null = null
  attackRange = 75
  attackDamage = 1
  attackSpeed = 3
  attackedAt = 0

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
      centerX: state.isHover ? state.mousePosition.x : 0,
      centerY: state.isHover ? state.mousePosition.y : 0
    }

    const directionX = target.centerX - tile.centerX
    const directionY = target.centerY - tile.centerY

    const angle = Math.atan2(directionY, directionX)

    ctx.beginPath()

    ctx.translate(tile.centerX, tile.centerY)
    ctx.rotate(angle)
    ctx.translate(-tile.centerX, -tile.centerY)

    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(tile.centerX, tile.centerY - 1, 12, 2)
    ctx.restore()

    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }
}
