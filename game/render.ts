// import type { Scene } from "./game-objects"

import type { MaybeRef } from "@vueuse/core"
import { selectCell } from "./actions"
import { Scene } from "./game-objects"
import { state } from './state'

const FRAMES_PER_SECOND = 60
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5

export function useRenderer(_cols: MaybeRef<number>, _rows: MaybeRef<number>, _tileSize: MaybeRef<number>) {
  const rows = isRef(_rows) ? _rows : ref(_rows)
  const cols = isRef(_cols) ? _cols : ref(_cols)
  const tileSize = isRef(_tileSize) ? _tileSize : ref(_tileSize)

  const containerRef = shallowRef<HTMLElement | null>(null)
  const canvasRef = shallowRef<HTMLCanvasElement | null>(null)

  // let canvas: HTMLCanvasElement | null = null
  let raf: number | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let startedAt = 0
  let lastFrameAt = 0

  function fitSize() {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) return
  
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
  }
  
  function init() {
    const canvas = canvasRef.value
    if (!canvas) return

    state.scene = markRaw(new Scene({
      width: canvas.width,
      height: canvas.height,
      cols: cols.value,
      rows: rows.value,
      tileSize: tileSize.value,
    }))
    state.scene?.init()
    console.log('init', state.scene)
  }

  function draw(time: number) {
    const canvas = canvasRef.value
    if (!canvas || !ctx) return

    if (!startedAt) {
      startedAt = time
    }

    const deltaTime = time - lastFrameAt

    // throttle fps
    if(time - lastFrameAt < FRAME_MIN_TIME){
      requestDraw()
      return
    }
    lastFrameAt = time

    // console.log('draw', deltaTime)
    // ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'grey'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    state.scene?.drawTree(ctx)
  }

  function requestDraw() {
    if (raf) {
      cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(draw)
  }
  
  onBeforeUnmount(() => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = null
    }
  })

  watch([canvasRef, containerRef], async () => {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) return

    ctx = canvas.getContext('2d', { alpha: false })

    canvas.onmouseenter = () => {
      if (state.isHover) return
      state.isHover = true
      requestDraw()
    }
    canvas.onmouseleave = () => {
      if (!state.isHover) return
      state.isHover = false
      requestDraw()
    }
    canvas.onmousemove = (event) => {
      state.mousePosition = {
        x: event.offsetX,
        y: event.offsetY
      }
      requestDraw()
    }
    canvas.onclick = (event) => {
      selectCell(event)
      requestDraw()
    }

    fitSize()
    init()
    requestDraw()
  })
  
  watch([rows, cols, tileSize], async () => {
    fitSize()
    init()
    requestDraw()
  })

  return {
    containerRef,
    canvasRef,
    init,
    draw,
    requestDraw,
  }
}