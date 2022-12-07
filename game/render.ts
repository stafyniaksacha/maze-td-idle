// import type { Scene } from "./game-objects"

import type { MaybeRef } from "@vueuse/core"
import { selectTile } from "./store"
import { Scene } from "./objects"
import { state } from './store'
import { LAYERS } from "./layers"

const FRAMES_PER_SECOND = 60
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5

export function useRenderer(_cols: MaybeRef<number>, _rows: MaybeRef<number>, _tileSize: MaybeRef<number>) {
  const rows = isRef(_rows) ? _rows : ref(_rows)
  const cols = isRef(_cols) ? _cols : ref(_cols)
  const tileSize = isRef(_tileSize) ? _tileSize : ref(_tileSize)

  const containerRef = shallowRef<HTMLElement | null>(null)
  const canvasRef = shallowRef<HTMLCanvasElement | null>(null)

  let raf: number | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let startedAt = 0
  let lastFrameAt = 0

  // resize canvas to fit container
  function fitSize() {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) return
  
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
  }
  
  // init scene
  function init() {
    const canvas = unref(canvasRef)
    if (!canvas) return

    state.scene = markRaw(new Scene({
      width: canvas.width,
      height: canvas.height,
      cols: cols.value,
      rows: rows.value,
      tileSize: tileSize.value,
    }))
    state.scene?.init()
    requestDraw()
  }

  // draw loop
  function draw(time: number) {
    raf = null
    const canvas = unref(canvasRef)
    if (!canvas || !ctx) return

    if (!startedAt) {
      startedAt = time
    }

    const deltaTime = time - lastFrameAt

    // throttle fps
    if(deltaTime < FRAME_MIN_TIME) {
      requestDraw()
      return
    }
    lastFrameAt = time

    // clear canvas
    ctx.save()
    ctx.fillStyle = 'grey'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    state.scene?.update(deltaTime)

    // draw all layers
    state.scene?.drawTree(ctx, LAYERS.BACKGROUND)
    state.scene?.drawTree(ctx, LAYERS.DEFAULT)
    requestDraw()
  }

  // request animation frame if not already requested
  function requestDraw() {
    if (!raf) {
      raf = requestAnimationFrame(draw)
    }
  }
  
  // clear animation frame on unmount
  onBeforeUnmount(() => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = null
    }
  })

  // init canvas scene when html canvas is ready
  watch([canvasRef, containerRef], async () => {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) return

    ctx = canvas.getContext('2d', { alpha: false })

    canvas.onmouseenter = () => {
      if (state.isHover) return
      state.isHover = true
    }
    canvas.onmouseleave = () => {
      if (!state.isHover) return
      state.isHover = false
    }
    canvas.onmousemove = (event) => {
      state.mousePosition = {
        x: event.offsetX,
        y: event.offsetY
      }
    }
    canvas.onclick = (event) => {
      selectTile(event)
    }

    fitSize()
    init()
  })
  
  // reinit when cols, rows or tileSize change
  watch([rows, cols, tileSize], async () => {
    fitSize()
    init()
  })

  return {
    containerRef,
    canvasRef,
    init,
    draw,
    requestDraw,
  }
}