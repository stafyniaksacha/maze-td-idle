import { Enemy } from "../enemies/Enemy";

import { BuildingAttacker } from "./BuildingAttacker";
import { GameObject } from "../GameObject";

class ArrowBullet extends GameObject {}

export class ArrowTower extends BuildingAttacker {
  attackBullet: ArrowBullet | null = null;
  attackTarget: Enemy | null = null
  attackRange: number = 75
  attackDamage: number = 1
  attackSpeed: number = 3
  attackedAt: number = 0

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx)

    const tile = this.tile
    if (!tile) return

    ctx.beginPath()
    ctx.arc(tile.cornerX + tile.width /2, tile.cornerY + tile.width /2, 10, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'orange'
    ctx.fill()
    ctx.restore()
  }
}