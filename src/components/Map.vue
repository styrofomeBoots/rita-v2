<script setup lang="ts">
import { ref } from "vue";

const url =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const center = ref([40, 40]);
const zoom = ref(0);
</script>
<template>
  <ol-map
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 100vh; width: 100vw"
  >
    <ol-view :zoom="zoom" :center="center" />
    <ol-tile-layer>
      <ol-source-xyz :url="url" />
    </ol-tile-layer>
  </ol-map>
</template>
