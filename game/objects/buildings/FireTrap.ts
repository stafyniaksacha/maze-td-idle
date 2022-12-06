import { Building } from "./Building";

export class FireTrap extends Building {
  blockPath: boolean = false

  draw(ctx: CanvasRenderingContext2D): void {
    const tile = this.tile
    if (!tile) return

    ctx.beginPath()
    ctx.arc(tile.cornerX + tile.width /2, tile.cornerY + tile.width /2, 10, 0, 2 * Math.PI)
    
    ctx.save()
    ctx.fillStyle = 'yellow'
    ctx.fill()
    ctx.restore()
  }
}