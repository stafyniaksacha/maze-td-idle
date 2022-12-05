<script lang="ts" setup>
import { state, useRenderer, toggleCanWalk } from './game'

const cols = ref(3)
const rows = ref(3)
const tileSize = ref(50)
const counter = ref(0)

const { containerRef, canvasRef, requestDraw } = useRenderer(cols, rows, tileSize)
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
        <div class="flex flex-row p-2 gap-2">
          <div class="w-1/2 flex flex-col gap-1">
            <button type="button" @click="() => {
              counter += 1
            }">
              counter ++
            </button>
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            {{ counter }}
          </div>
        </div>
        <div class="flex flex-row">
          <div class="bg-slate-500 w-full">
            <pre>{{ { ...state, scene: state.scene?.toString() } }}</pre>
          </div>
        </div>
        <div class="flex flex-row" v-if="state.selectedCell">
          <div class="bg-slate-500 w-full">
            <button type="button" @click="() => {
              toggleCanWalk()
              requestDraw()
            }">
              toggle canWalk
            </button>
          </div>
          <div class="bg-slate-500 w-full">
            <pre>{{ JSON.stringify(state.selectedCell, null, 2) }}</pre>
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
