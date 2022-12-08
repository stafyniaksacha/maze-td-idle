import { Enemy } from './Enemy'

export class BasicEnemy extends Enemy {
  radius = 5
  // baseHealth = 1

  draw (ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'chartreuse'
    ctx.fill()
    ctx.restore()
  }
}
