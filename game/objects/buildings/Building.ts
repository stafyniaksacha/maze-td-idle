import { Tile } from "../tiles";
import { GameObject } from "../GameObject";

export class Building extends GameObject {
  blockPath: boolean = true

  get tile () {
    return this.parentOfType(Tile)
  }

  remove(): void {
    this.tile?.removeBuilding()
  }
}