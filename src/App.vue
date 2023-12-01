<script setup lang="ts">
import { ref } from "vue";
import { Bars2Icon } from "@heroicons/vue/20/solid";
import Sidenav from "./components/Sidenav.vue";

const showMenu = ref(false);
</script>

<template>
  <div class="relative min-h-screen xl:flex">
    <!-- mobile menu bar -->
    <div class="bg-gray-800 text-gray-100 flex justify-between xl:hidden">
      <!-- logo -->
      <a href="" class="block p-4 text-white font-bold">rita</a>
      <!-- menu button -->
      <button
        class="p-4 focus:outline-none focus:bg-gray-700"
        @click="showMenu = !showMenu"
      >
        <Bars2Icon class="h-5 w-5" />
      </button>
    </div>

    <!-- sidebar -->
    <Sidenav :show-menu="showMenu" />

    <!-- content -->
    <div class="flex-1 p-10 text-2xl font-bold">maps boi</div>
  </div>
</template>

<style></style>
