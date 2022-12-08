<script lang="ts" setup>
import { state, useRenderer, tryAddBuildingToSelection, ArrowTower, FireTrap, removeBuilding, startWave } from './game'

const cols = ref(3)
const rows = ref(3)
const tileSize = ref(50)

const { containerRef, canvasRef } = useRenderer(cols, rows, tileSize)

const building = computed(() => {
  if (!state.selectedTile) { return }

  return state.buildings?.[state.selectedTile.indexX]?.[state.selectedTile.indexY]
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
      <div class="flex flex-col h-full  overflow-y-auto">
        <div class="flex flex-row p-2 gap-2">
          <div class="w-full flex flex-col gap-1">
            <label for="tileSize">tileSize</label>
            <input id="tileSize" v-model="tileSize" type="number" step="2" min="2">
          </div>
        </div>
        <div class="flex flex-row p-2 gap-2">
          <div class="w-1/2 flex flex-col gap-1">
            <label for="rows">Rows</label>
            <input id="rows" v-model="rows" type="number" min="1">
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            <label for="cols">Cols</label>
            <input id="cols" v-model="cols" type="number" min="1">
          </div>
        </div>
        <div class="flex flex-row p-2 gap-2">
          <div class="w-1/2 flex flex-col gap-1">
            <div>Wave</div>
            <div>{{ state.wave.current }}</div>
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            <div>Currency</div>
            <div>{{ state.currency }}</div>
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            <div>Health</div>
            <div>{{ state.health }}</div>
          </div>
        </div>
        <div class="flex flex-row p-2 gap-2">
          <div class="w-1/2 flex flex-col gap-1">
            <div>Remaining</div>
            <div>{{ state.wave.enemiesRemaining }}</div>
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            <div>Spawned</div>
            <div>{{ state.wave.enemiesSpawned }}</div>
          </div>
          <div class="w-1/2 flex flex-col gap-1">
            <div>Alive</div>
            <div>{{ state.wave.enemiesAlives }}</div>
          </div>
        </div>

        <div v-if="state.selectedTile" class="flex flex-row">
          <div class="bg-green-500 w-full flex gap-2 p-2">
            <button
              type="button"
              class="w-1/2 border"
              @click="() => {
                tryAddBuildingToSelection(new FireTrap())
              }"
            >
              build fire trap
            </button>
            <button
              type="button"
              class="w-1/2 border"
              @click="() => {
                tryAddBuildingToSelection(new ArrowTower())
              }"
            >
              build arrow tower
            </button>
          </div>
        </div>

        <div v-if="building" class="flex flex-row">
          <div class="bg-red-500 w-full flex gap-2 p-2">
            <button
              type="button"
              class="w-full border"
              @click="() => {
                removeBuilding()
              }"
            >
              sell building
            </button>
          </div>
        </div>

        <div class="flex flex-row">
          <div class="bg-lime-500 w-full flex gap-2 p-2" :class="[state.wave.started ? 'bg-orange-600' : 'bg-lime-500']">
            <button
              type="button"
              class="w-full border"
              @click="() => {
                startWave()
              }"
            >
              {{ state.wave.started ? `wave in progress` : `start wave ${state.wave.current}` }}
            </button>
          </div>
        </div>

        <div v-if="state.selectedTile" class="flex flex-row">
          <div class="bg-green-500 w-full">
            <!-- <pre>{{ state.selectedTile }}</pre> -->
          </div>
        </div>
        <div class="flex flex-row">
          <div class="bg-slate-500 w-full">
            <!-- <pre>{{ state }}</pre> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
