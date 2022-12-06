import type { Tile, Scene } from "../objects";

interface GameState {
  isHover: boolean
  wave: { started: boolean; current: number; enemiesSpawned: number; enemiesAlives: number };
  mousePosition: { x: number; y: number };
  selectedTile: { indexX: number; indexY: number, tile?: Tile } | null;
  scene: Scene | null;
  buildings: { name: string }[][];
}

export const state = reactive<GameState>({
  isHover: false,
  wave: { started: false, current: 1, enemiesAlives: 0, enemiesSpawned: 0 },
  mousePosition: { x: 0, y: 0 },
  selectedTile: null,
  scene: null,
  buildings: [],
})