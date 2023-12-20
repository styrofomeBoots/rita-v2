<script setup lang="ts">
import { ref } from "vue";
import { useGeographic } from "ol/proj";

useGeographic();

const url =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const center = ref([-82.999207, 39.959423]);
const zoom = ref(13.1);
</script>

<template>
  <ol-map
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 100vh; width: 100vw"
    :controls="[]"
  >
    <ol-view :zoom="zoom" :center="center" />
    <ol-tile-layer>
      <ol-source-xyz :url="url" />
    </ol-tile-layer>
  </ol-map>
</template>
