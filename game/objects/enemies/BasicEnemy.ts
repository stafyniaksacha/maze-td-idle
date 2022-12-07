import { Enemy } from "./Enemy";

export class BasicEnemy extends Enemy {
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.arc(this.centerX, this.centerY, 5, 0, 2 * Math.PI)
    
    ctx.save()
    ctx.fillStyle = 'chartreuse'
    ctx.fill()
    ctx.restore()
  }
}