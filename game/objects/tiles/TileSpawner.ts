import { Tile } from './Tile'

export class TileSpawner extends Tile {
  walkCost = 5

  draw (ctx: CanvasRenderingContext2D) {
    super.draw(ctx)

    // draw green circle on tile
    ctx.beginPath()
    ctx.arc(this.cornerX + this.width / 2, this.cornerY + this.width / 2, 10, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'green'
    ctx.fill()
    ctx.restore()
  }
}
