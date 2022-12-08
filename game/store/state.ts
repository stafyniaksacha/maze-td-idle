import type { Tile, Scene } from '../objects'

interface GameState {
  isHover: boolean
  health: number;
  currency: number;
  wave: { started: boolean; current: number; enemiesRemaining: number; enemiesSpawned: number; enemiesAlives: number };
  mousePosition: { x: number; y: number };
  selectedTile: { indexX: number; indexY: number, tile?: Tile } | null;
  scene: Scene | null;
  buildings: { name: string }[][];
  // grid: {
  //   cols: number;
  //   rows: number;
  //   tileSize: number;
  // }
}

export const state = reactive<GameState>({
  isHover: false,
  health: 10,
  currency: 10,
  wave: { started: false, current: 1, enemiesRemaining: 0, enemiesAlives: 0, enemiesSpawned: 0 },
  mousePosition: { x: 0, y: 0 },
  selectedTile: null,
  scene: null,
  buildings: [],
  // grid: {
  //   cols: 3,
  //   rows: 3,
  //   tileSize: 50,
  // },
})
