// import type { Scene } from "./game-objects"

import type { MaybeRef } from '@vueuse/core'
import { selectTile, state } from './store'
import { Scene } from './objects'
import { LAYERS, LAYER_ORDER } from './layers'

const FRAMES_PER_SECOND = 60
const FRAME_MIN_TIME = (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5

export function useRenderer (_cols: MaybeRef<number>, _rows: MaybeRef<number>, _tileSize: MaybeRef<number>) {
  const rows = isRef(_rows) ? _rows : ref(_rows)
  const cols = isRef(_cols) ? _cols : ref(_cols)
  const tileSize = isRef(_tileSize) ? _tileSize : ref(_tileSize)

  const containerRef = shallowRef<HTMLElement | null>(null)
  const canvasRef = shallowRef<HTMLCanvasElement | null>(null)

  const layersOffcanvas = {
    [LAYERS.BACKGROUND]: null,
    [LAYERS.DEFAULT]: null
  } as Record<LAYERS, HTMLCanvasElement | null>
  const layersCtx = {
    [LAYERS.BACKGROUND]: null,
    [LAYERS.DEFAULT]: null
  } as Record<LAYERS, CanvasRenderingContext2D | null>

  let raf: number | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let startedAt = 0
  let lastFrameAt = 0

  // resize canvas to fit container
  function fitSize () {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) { return }

    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    layersOffcanvas[LAYERS.BACKGROUND]!.width = canvas.width
    layersOffcanvas[LAYERS.BACKGROUND]!.height = canvas.height

    layersOffcanvas[LAYERS.DEFAULT]!.width = canvas.width
    layersOffcanvas[LAYERS.DEFAULT]!.height = canvas.height
  }

  // init scene
  function init () {
    const canvas = unref(canvasRef)
    if (!canvas) { return }

    state.scene = markRaw(new Scene({
      width: canvas.width,
      height: canvas.height,
      cols: cols.value,
      rows: rows.value,
      tileSize: tileSize.value
    }))
    state.scene?.init()
    requestDraw()
  }

  // draw loop
  function draw (time: number) {
    raf = null
    const canvas = unref(canvasRef)
    if (!canvas || !ctx) { return }

    if (!startedAt) {
      startedAt = time
    }

    const deltaTime = time - lastFrameAt

    // throttle fps
    if (deltaTime < FRAME_MIN_TIME) {
      requestDraw()
      return
    }
    lastFrameAt = time

    state.scene?.update(deltaTime)

    // draw each layers
    for (const layer of LAYER_ORDER) {
      layersCtx[layer]!.clearRect(0, 0, canvas.width, canvas.height)
      state.scene?.drawTree(layersCtx[layer]!, layer)
    }

    // ctx.save()
    // ctx.fillStyle = 'grey'
    // ctx.fillRect(0, 0, canvas.width, canvas.height)
    // ctx.restore()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw layers to canvas
    for (const layer of LAYER_ORDER) {
      ctx.drawImage(layersOffcanvas[layer]!, 0, 0)
    }

    requestDraw()
  }

  // request animation frame if not already requested
  function requestDraw () {
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
  watch([canvasRef, containerRef], () => {
    const canvas = canvasRef.value
    const container = containerRef.value
    if (!canvas || !container) { return }

    layersOffcanvas[LAYERS.BACKGROUND] = document.createElement('canvas')
    layersOffcanvas[LAYERS.DEFAULT] = document.createElement('canvas')

    layersCtx[LAYERS.BACKGROUND] = layersOffcanvas[LAYERS.BACKGROUND]!.getContext('2d')
    layersCtx[LAYERS.DEFAULT] = layersOffcanvas[LAYERS.DEFAULT]!.getContext('2d')
    ctx = canvas.getContext('2d')

    canvas.onmouseenter = () => {
      if (state.isHover) { return }
      state.isHover = true
    }
    canvas.onmouseleave = () => {
      if (!state.isHover) { return }
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
  watch([rows, cols, tileSize], () => {
    fitSize()
    init()
  })

  return {
    containerRef,
    canvasRef,
    init,
    draw,
    requestDraw
  }
}
