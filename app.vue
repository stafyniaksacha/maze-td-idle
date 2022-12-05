<script lang="ts" setup>
let raf: number | null = null
let ctx: CanvasRenderingContext2D | null = null

const FRAMES_PER_SECOND = 60
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5

let gridOffsetX = 0
let gridOffsetY = 0
let startedAt = 0
let lastFrameAt = 0

const rows = ref(3)
const cols = ref(3)

const tileSize = ref(50)

const containerRef = shallowRef<HTMLElement | null>(null)
const canvasRef = shallowRef<HTMLCanvasElement | null>(null)

const isHover = ref(false)
const mousePos = ref({ x: 0, y: 0 })

class Cell {
  indexX: number = 0
  indexY: number = 0
  cellX: number = 0
  cellY: number = 0
  cellWidth: number = 0
  cellHeight: number = 0
  canWalk: boolean = true
  canBuild: boolean = true
  isSpawn: boolean = false
  isGoal: boolean = false
  isHover: boolean = false
  isOdd: boolean = false

  constructor(
    props: {
      indexX: number,
      indexY: number,
      cellX: number,
      cellY: number,
      cellWidth: number,
      cellHeight: number
    }
  ) {
    this.indexX = props.indexX
    this.indexY = props.indexY
    this.cellX = props.cellX
    this.cellY = props.cellY
    this.cellWidth = props.cellWidth
    this.cellHeight = props.cellHeight
  }

  draw() {
    if (!ctx) return

    // Draw debug grid
    if (!this.canWalk) {
      ctx.fillStyle = 'wheat'
    } else if (this.isOdd) {
      ctx.fillStyle = 'black'
    } else {
      ctx.fillStyle = 'white'
    }
    ctx.fillRect(this.cellX, this.cellY, tileSize.value, tileSize.value)

    // Draw hover
    let currentCellHover = false
    if (isHover.value) {
      if (mousePos.value.x >= this.cellX && mousePos.value.x <= this.cellX + this.cellWidth &&
        mousePos.value.y >= this.cellY && mousePos.value.y <= this.cellY + this.cellHeight) {
        currentCellHover = true
      }
    }
    if (currentCellHover) {
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 6
      ctx.strokeRect(this.cellX + 3, this.cellY + 3, tileSize.value - 6, tileSize.value - 6)
    } 

    // Draw selection
    if (selectedCell.value?.indexX === this.indexX && selectedCell.value?.indexY === this.indexY) {
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 6
      ctx.strokeRect(this.cellX + 3, this.cellY + 3, tileSize.value - 6, tileSize.value - 6)
    } 
  }
}

const selectedCell = ref<Cell | null>(null)

const grid: Cell[][] = []
const cells: Cell[] = []

const path: Cell[] = []

function toggleCanWalk() {
  if (!selectedCell.value) return

  selectedCell.value.canWalk = !selectedCell.value.canWalk

  path.splice(0, path.length)
  path.push(...getAStarPath(grid[0][0], grid[cols.value - 1][rows.value - 1]))

  requestDraw()
}

function getCellAtPos(x: number, y: number) {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    if (x >= cell.cellX && x <= cell.cellX + cell.cellWidth &&
      y >= cell.cellY && y <= cell.cellY + cell.cellHeight) {
      return cell
    }
  }
  return null
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

  console.log('draw', deltaTime)

  // ctx.clearRect(0, 0, canvas.width, canvas.height)


  ctx.fillStyle = 'grey'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // const tileSize = Math.floor(canvas.width / cols.value)
  // const tileSize = Math.floor(canvas.height / rows.value)

  // draw grid

  ctx.save()
  for (const row of grid) {
    for (const cell of row) {
      cell.draw()
    }
  }
  ctx.restore()

  // ctx.save()

  // // for (let i = 0; i < cols.value; i++) {
  // //   const rowOdd = i % 2 === 0
  // //   for (let j = 0; j < rows.value; j++) {
  // //     const lineOdd = j % 2 === 0
  // //     const cellX = gridOffsetX + i * tileSize.value
  // //     const cellY = gridOffsetY + j * tileSize.value
  // //     const cellWidth = tileSize.value
  // //     const cellHeight = tileSize.value
  // //     let currentCellHover = false

  // //     if (isHover.value) {

  // //       if (mousePos.value.x >= cellX && mousePos.value.x <= cellX + cellWidth &&
  // //         mousePos.value.y >= cellY && mousePos.value.y <= cellY + cellHeight) {
  // //         currentCellHover = true
  // //       }
  // //     }
      
  // //     // else {
  // //       if (rowOdd === lineOdd) {
  // //         ctx.fillStyle = 'black'
  // //       } else {
  // //         ctx.fillStyle = 'white'
  // //       }
  // //     // }
  // //     ctx.fillRect(cellX, cellY, tileSize.value, tileSize.value)

  // //     if (currentCellHover) {
  // //       ctx.strokeStyle = 'red'
  // //       ctx.lineWidth = 6
  // //       ctx.strokeRect(cellX + 3, cellY + 3, tileSize.value - 6, tileSize.value - 6)
  // //     } 
  // //   }
  // // }
  // ctx.restore()

  // draw red circle on first cell
  ctx.save()
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(gridOffsetX + tileSize.value / 2, gridOffsetY + tileSize.value / 2, 10, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()
  

  // draw green circle on last cell
  ctx.save()
  ctx.fillStyle = 'green'
  ctx.beginPath()
  ctx.arc(gridOffsetX + (cols.value - 0.5) * tileSize.value, gridOffsetY + (rows.value - 0.5) * tileSize.value, 10, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  // draw blue line from first to last cell, passing through the middle cells
  if (path.length) {
    ctx.save()
    ctx.strokeStyle = 'magenta'
    ctx.lineWidth = 3
    ctx.setLineDash([4, 4])

    ctx.beginPath()
    ctx.moveTo(path[0].cellX + path[0].cellWidth / 2, path[0].cellY + path[0].cellHeight / 2)
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].cellX + path[i].cellWidth / 2, path[i].cellY + path[i].cellHeight / 2)
    }
    ctx.stroke()
    ctx.restore()
  }
}

function requestDraw() {
  if (raf) {
    cancelAnimationFrame(raf)
  }
  raf = requestAnimationFrame(draw)
}

function initGridCells() {
  const canvas = canvasRef.value
  if (!canvas) return
  // console.log('initGridCells', canvas)

  grid.splice(0, grid.length)
  cells.splice(0, cells.length)

  for (let x = 0; x < cols.value; x++) {
    grid[x] = [] as Cell[]
    const rowOdd = x % 2 === 0

    for (let y = 0; y < rows.value; y++) {
      const lineOdd = y % 2 === 0

      grid[x][y] = new Cell({
        indexX: x,
        indexY: y,
        cellX: gridOffsetX + x * tileSize.value,
        cellY: gridOffsetY + y * tileSize.value,
        cellWidth: tileSize.value,
        cellHeight: tileSize.value
      })

      if (x === 0 && y === 0) {
        grid[x][y].isSpawn = true
        grid[x][y].canBuild = false
      } else if (x === cols.value - 1 && y === rows.value - 1) {
        grid[x][y].isGoal = true
        grid[x][y].canBuild = false
      }

      if (rowOdd === lineOdd) {
        grid[x][y].isOdd = true
      }

      cells.push(grid[x][y])
    }
  }

  path.splice(0, path.length)
  path.push(...getAStarPath(grid[0][0], grid[cols.value - 1][rows.value - 1]))
}

function heuristicCostEstimate(a: Cell, b: Cell) {
  return Math.abs(a.indexX - b.indexX) + Math.abs(a.indexY - b.indexY)
}

function reconstructPath(cameFrom: Map<Cell, Cell>, current: Cell) {
  const totalPath = [current]
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!
    totalPath.unshift(current)
  }
  return totalPath
}

function getNeighbors(current: Cell) {
  const neighbors = [] as Cell[]
  const { indexX, indexY } = current

  if (indexX > 0) {
    neighbors.push(grid[indexX - 1][indexY])
  }
  if (indexX < cols.value - 1) {
    neighbors.push(grid[indexX + 1][indexY])
  }
  if (indexY > 0) {
    neighbors.push(grid[indexX][indexY - 1])
  }
  if (indexY < rows.value - 1) {
    neighbors.push(grid[indexX][indexY + 1])
  }

  return neighbors
}

function getAStarPath(start: Cell, goal: Cell) {
  const openSet = new Set<Cell>()
  openSet.add(start)

  const cameFrom = new Map<Cell, Cell>()

  const gScore = new Map<Cell, number>()
  const fScore = new Map<Cell, number>()

  gScore.set(start, 0)
  fScore.set(start, heuristicCostEstimate(start, goal))


  while (openSet.size) {
    let current: Cell | undefined
    let currentFScore = Number.POSITIVE_INFINITY

    for (const cell of openSet) {
      const cellFScore = fScore.get(cell) ?? Number.POSITIVE_INFINITY
      if (cellFScore < currentFScore) {
        current = cell
        currentFScore = cellFScore
      }
    }

    if (!current) {
      return []
    }

    if (current === goal) {
      return reconstructPath(cameFrom, current)
    }


    openSet.delete(current)

    const neighbors = getNeighbors(current)

    for (const neighbor of neighbors) {
      if (!neighbor.canWalk) continue

      const tentativeGScore = (gScore.get(current) ?? 0) + heuristicCostEstimate(current, neighbor)

      if (tentativeGScore >= (gScore.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
        continue
      }

      cameFrom.set(neighbor, current)
      gScore.set(neighbor, tentativeGScore)
      fScore.set(neighbor, tentativeGScore + heuristicCostEstimate(neighbor, goal))

      if (!openSet.has(neighbor)) {
        openSet.add(neighbor)
      }
    }
  }
  return []
}

function fitSize() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  canvas.width = container.offsetWidth
  canvas.height = container.offsetHeight

  const gridWidth = cols.value * tileSize.value
  gridOffsetX = Math.floor((canvas.width - gridWidth) / 2)

  const gridHeight = rows.value * tileSize.value
  gridOffsetY = Math.floor((canvas.height - gridHeight) / 2)
}

watch([canvasRef, containerRef], async () => {
  await nextTick()
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  ctx = canvas.getContext('2d', { alpha: false })

  fitSize()
  initGridCells()
  canvas.onmouseenter = () => {
    if (isHover.value) return
    isHover.value = true
    requestDraw()
  }
  canvas.onmouseleave = () => {
    if (!isHover.value) return
    isHover.value = false
    requestDraw()
  }
  canvas.onmousemove = (event) => {
    mousePos.value = {
      x: event.offsetX,
      y: event.offsetY
    }
    requestDraw()
  }
  canvas.onclick = (event) => {
    const cell = getCellAtPos(event.offsetX, event.offsetY)
    selectedCell.value = cell
  }

  setTimeout(() => {
    requestDraw()
  }, 0)
})

watch([rows, cols, tileSize], async () => {
  fitSize()
  initGridCells()
  requestDraw()
})
useResizeObserver(containerRef, () => {
  fitSize()
  initGridCells()
  requestDraw()
})

onBeforeUnmount(() => {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = null
  }
})
</script>

<template>
  <div class="flex flex-1 w-screen h-screen">
    <!-- game area -->
    <div class="bg-red-500 w-8/12 flex p-5">
      <div class="w-full h-full bg-red-300 p-5 border">
        <div ref="containerRef" class="w-full h-full">
          <canvas ref="canvasRef" />
        </div>
      </div>
    </div>
    <!-- panel -->
    <div class="bg-blue-500 w-4/12">
      <div class="flex flex-col h-full">
        <div class="flex flex-row p-2 gap-2">
          <div class="w-full flex flex-col gap-1">
            <label for="tileSize">tileSize</label>
            <input id="tileSize" type="number" v-model="tileSize" step="2" min="2" />
          </div>
        </div>
        <div class="flex flex-row p-2 gap-2">
          <div class="w-1/2 flex flex-col gap-1">
            <label for="rows">Rows</label>
            <input id="rows" type="number" v-model="rows" min="1" />
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            <label for="cols">Cols</label>
            <input id="cols" type="number" v-model="cols" min="1" />
          </div>
        </div>
        <div class="flex flex-row">
          <div class="bg-slate-500 w-full">
            <pre>{{mousePos}}</pre>
          </div>
        </div>
        <div class="flex flex-row" v-if="selectedCell">
          <div class="bg-slate-500 w-full">
            <button type="button" @click="toggleCanWalk">
              toggle canWalk
            </button>
          </div>
          <div class="bg-slate-500 w-full">
            <pre>{{selectedCell}}</pre>
          </div>
        </div>
        <div class="grow"></div>
        <div class="flex flex-row">
          <div class="bg-green-500 w-1/2">g</div>
          <div class="bg-green-500 w-1/2">h</div>
        </div>
      </div>

    </div>
  </div>
</template>
