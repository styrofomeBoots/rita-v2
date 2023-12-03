<script setup lang="ts">
import { ref } from "vue";
import { Bars2Icon } from "@heroicons/vue/20/solid";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";

import Sidenav from "./components/Sidenav.vue";
import SettingsModal from "./components/SettingsModal.vue";
import Map from "./components/Map.vue";

const showMenu = ref(false);
const showSettings = ref(false);
</script>

<template>
  <div class="relative min-h-screen">
    <!-- mobile menu bar -->
    <div class="bg-gray-800 text-gray-100 flex justify-between">
      <!-- logo -->
      <a href="" class="block p-4 text-white font-bold">rita</a>
      <!-- modal button -->
      <button
        @click="showSettings = true"
        class="p-4 focus:outline-none focus:bg-gray-700"
      >
        <Cog6ToothIcon class="h-5 w-5" />
      </button>
      <!-- menu button -->
      <button
        @click="showMenu = !showMenu"
        class="p-4 focus:outline-none focus:bg-gray-700"
      >
        <Bars2Icon class="h-5 w-5" />
      </button>
    </div>

    <!-- sidebar -->
    <Sidenav :show-menu="showMenu" />

    <!-- content -->
    <!-- <div class="flex-1 p-10 text-2xl font-bold">maps boi</div> -->
    <Map />

    <!-- settings modal -->
    <SettingsModal v-show="showSettings" @close="showSettings = false" />
  </div>
</template>
