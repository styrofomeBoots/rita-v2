<script setup lang="ts">
import SideDrawer from "./components/SideDrawer.vue";
// import ToneBoy from "@/components/ToneBoy.vue";
import { useMapStore } from "./stores/mapStore";

useMapStore();
</script>

<template>
  <div class="h-screen overflow-hidden">
    <SideDrawer />
    <!-- <ToneBoy /> -->
  </div>
</template>
