import type { Scene } from "../objects";

interface GameState {
  isHover: boolean
  mousePosition: { x: number; y: number };
  selectedCell: { indexX: number; indexY: number } | null;
  scene: Scene | null;
}

export const state = reactive<GameState>({
  isHover: false,
  mousePosition: { x: 0, y: 0 },
  selectedCell: null,
  scene: null
})