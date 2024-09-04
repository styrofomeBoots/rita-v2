<script setup lang="ts">
import SideDrawer from "./components/SideDrawer/SideDrawer.vue";
import StationMap from "./components/StationMap.vue";
import { useStations } from "./composables/useStations/useStations";

const { isReady, startStationPolling } = useStations();
startStationPolling();
</script>

<template>
  <div class="h-dvh">
    <SideDrawer />
    <StationMap v-if="isReady" />
  </div>
</template>
