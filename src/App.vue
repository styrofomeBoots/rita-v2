<script setup lang="ts">
import SideDrawer from "./components/SideDrawer/SideDrawer.vue";
import StationMap from "./components/StationMap.vue";
import { useStations } from "./composables/useStations/useStations";

const { isReady } = useStations();
</script>

<template>
  <div class="h-screen">
    <SideDrawer />
    <StationMap v-if="isReady" />
  </div>
</template>
