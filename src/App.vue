<script setup lang="ts">
import SideDrawer from "./components/SideDrawer.vue";
import StationMap from "./components/StationMap.vue";
import { useMapStore } from "./stores/mapStore";

const mapStore = useMapStore();
</script>

<template>
  <div class="h-screen">
    <SideDrawer />
    <StationMap v-if="mapStore.isReady" />
  </div>
</template>
