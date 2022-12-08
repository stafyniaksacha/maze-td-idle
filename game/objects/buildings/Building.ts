import { Tile } from '../tiles'
import { GameObject } from '../GameObject'

export class Building extends GameObject {
  blockPath = true

  get tile () {
    return this.parentOfType(Tile)
  }

  remove (): void {
    this.tile?.removeBuilding()
  }
}
