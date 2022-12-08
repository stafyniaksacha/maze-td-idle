import { Enemy } from '../enemies'
import { GameObject } from '../GameObject'
import { Building } from './Building'

import { isTileSelected } from '~~/game/utils'

export abstract class BuildingAttacker extends Building {
  abstract attackBullet: GameObject | null
  abstract attackTarget: Enemy | null
  abstract attackRange: number
  abstract attackDamage: number
  abstract attackSpeed: number
  abstract attackedAt: number

  draw (ctx: CanvasRenderingContext2D): void {
    const tile = this.tile
    if (!tile) { return }
    if (!isTileSelected(tile)) { return }

    ctx.beginPath()
    ctx.arc(tile.cornerX + tile.width / 2, tile.cornerY + tile.width / 2, this.attackRange, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0, 255, 0, 1)'
    ctx.stroke()
    ctx.restore()
  }
}
