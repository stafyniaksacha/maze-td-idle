import { Scene, Cell } from "./game-objects";

interface GameState {
  isHover: boolean
  mousePosition: { x: number; y: number };
  selectedCell: { indexX: number; indexY: number; cell?: Cell } | null;
  scene: Scene | null;
}

// export let scene: Scene | null = null;
// export function setScene(_scene: Scene) {
//   scene = _scene
//   return scene
// }

export const state = reactive<GameState>({
  isHover: false,
  mousePosition: { x: 0, y: 0 },
  selectedCell: null,
  scene: null
})