<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/20/solid";

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <!-- dark background -->
  <div
    @click.self="emit('close')"
    class="fixed z-40 left-0 top-0 bg-black bg-opacity-50 w-screen h-screen flex justify-center items-center"
  >
    <!-- modal -->
    <div class="bg-gray-700 text-white rounded-md shadow-md p-2 w-72 flex-row">
      <!-- close button -->
      <div class="text-right">
        <button
          @click="emit('close')"
          class="text-blue-900/70 hover:text-blue-900 hover:bg-blue-200 rounded-md"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="text-center text-lg">rita</div>
      <div class="text-center text-xs">
        an a/v representation of bike share programs
      </div>
    </div>
  </div>
</template>
