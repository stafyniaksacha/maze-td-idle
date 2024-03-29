import { GameObject } from './GameObject'
import { Grid } from './Grid'
import { Path } from './Path'
import { Spawner } from './Spawner'

export class Scene extends GameObject {
  get grid () {
    return this.childOfType(Grid)
  }

  get path () {
    return this.childOfType(Path)
  }

  get spawner () {
    return this.childOfType(Spawner)
  }

  constructor (props?: {
    width: number
    height: number
    rows: number
    cols: number
    tileSize: number
  }) {
    super()

    this.addChild(new Grid(props))
    this.addChild(new Path())
    this.addChild(new Spawner())
  }
}
