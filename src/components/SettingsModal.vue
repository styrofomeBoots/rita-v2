<script setup lang="ts">
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/vue/20/solid";

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
    <div class="bg-gray-700 text-white rounded-md p-2 w-72 flex-row">
      <!-- buttons -->
      <div class="flex justify-between">
        <button
          class="rounded-md focus:outline-none focus:bg-gray-700 hover:bg-gray-600"
        >
          <QuestionMarkCircleIcon class="w-5 h-5" />
        </button>
        <button
          @click="emit('close')"
          class="rounded-md focus:outline-none focus:bg-gray-700 hover:bg-gray-600"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <!-- header -->
      <div>
        <div class="text-center text-lg">rita</div>
        <div class="text-center text-xs">
          an a/v representation of bike share programs
        </div>
      </div>

      <!-- settings -->
      <!-- <div></div> -->
      <!-- about -->
      <!-- <div>
        <div class="text-center text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci
          dolores culpa reprehenderit blanditiis nihil nobis?
        </div>
      </div> -->
    </div>
  </div>
</template>
