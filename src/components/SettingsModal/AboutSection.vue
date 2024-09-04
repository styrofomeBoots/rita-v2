<script setup lang="ts">
import { ref } from "vue";

const showRita = ref(false);

const toggleRita = (): void => {
  showRita.value = !showRita.value;
};
</script>

<template>
  <div class="flex flex-grow flex-col gap-1">
    <Transition
      enter-active-class="transition-opacity duration-300 delay-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div v-if="!showRita" class="text-pretty px-2 text-center">
        <p>
          Bike rental stations are mapped by their latitude and longitude, with a
          grid sized to the browser's dimensions. The x-axis maps to notes in the C
          major pentatonic scale, and the y-axis to octaves one through five. When a
          bike is checked out or returned, the corresponding station's note plays.
        </p>
        <p>
          Zooming into different areas of the map changes the note and octave
          assigned to each station.
        </p>
      </div>
      <div v-else-if="showRita">
        <img
          src="../../assets/mean-rita.jpeg"
          alt="mean-rita"
          class="mx-auto h-[15rem] w-fit rounded-md object-scale-down"
        />
      </div>
    </Transition>
    <div class="flex flex-col items-center">
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
