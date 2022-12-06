import { Tile } from "./Tile";

export class TileGoal extends Tile {
  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx)

    // draw red circle on tile
    ctx.beginPath()
    ctx.arc(this.cornerX + this.width /2, this.cornerY + this.width /2, 10, 0, 2 * Math.PI)

    ctx.save()
    ctx.fillStyle = 'red'
    ctx.fill()
    ctx.restore()
  }
}
