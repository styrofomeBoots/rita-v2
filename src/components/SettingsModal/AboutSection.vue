<script setup lang="ts">
import { ref } from "vue";

const showRita = ref(false);
const toggleRita = (): void => {
  showRita.value = !showRita.value;
};
</script>

<template>
  <div class="relative flex h-full flex-col justify-end">
    <transition
      enter-active-class="transition-opacity duration-300 delay-500"
      leave-active-class="transition-opacity duration-300 absolute top-0"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="!showRita" class="flex-grow flex-col">
        <p class="text-pretty px-3 text-center">
          Bike rental stations are mapped by their latitude and longitude, with a
          grid sized to the browser's dimensions. The x-axis maps to notes in the C
          major pentatonic scale, and the y-axis to octaves one through five. When a
          bike is checked out or returned, the corresponding station's note plays.
        </p>
        <p class="text-pretty px-3 text-center">
          Zooming into different areas of the map changes the note and octave
          assigned to each station.
        </p>
      </div>
    </transition>
    <transition
      enter-active-class="transition-all duration-300 delay-500"
      leave-active-class="transition-all duration-300 absolute top-0"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showRita" class="mt-1 w-full flex-grow">
        <img
          src="../../assets/mean-rita.jpeg"
          alt="mean-rita"
          class="mx-auto mb-1 h-[14.5rem] w-fit rounded-md object-scale-down"
        />
      </div>
    </transition>
    <div class="flex flex-col items-center gap-1">
      <a class="link text-sm" @click="toggleRita">
        {{ showRita ? "cute" : "show me the rita" }}
      </a>
      <a
        href="https://github.com/styrofomeBoots/rita-v2"
        target="_blank"
        rel="noopener noreferrer"
        class="link text-sm"
        >show me the code</a
      >
    </div>
  </div>
</template>
