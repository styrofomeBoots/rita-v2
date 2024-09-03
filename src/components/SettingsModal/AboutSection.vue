<script setup lang="ts">
import { ref } from "vue";

const showRita = ref(false);
const toggleRita = (): void => {
  showRita.value = !showRita.value;
};
</script>

<template>
  <div class="relative">
    <div
      class="absolute top-0 flex flex-col justify-center text-pretty px-3 text-center transition-opacity duration-500"
      :class="!showRita ? 'opacity-100 delay-300' : 'opacity-0'"
    >
      <div v-if="!showRita">
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
        <a v-if="!showRita" class="link mt-1 text-sm" @click="toggleRita"
          >show me the rita</a
        >
      </div>
    </div>
    <div
      class="absolute top-0 mt-2 w-full text-center transition-opacity duration-500"
      :class="showRita ? 'opacity-100 delay-300' : 'opacity-0'"
    >
      <div v-if="showRita">
        <img
          src="../../assets/mean-rita.jpeg"
          alt="mean-rita"
          class="mx-auto mb-1 h-[14.25rem] w-fit rounded-md object-scale-down"
        />
        <a class="link text-sm" @click="toggleRita">cute</a>
      </div>
    </div>
  </div>
</template>
