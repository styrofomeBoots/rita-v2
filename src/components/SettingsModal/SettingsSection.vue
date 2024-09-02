<script setup lang="ts">
import { useTone } from "@/composables/useTone/useTone";
import { useStations } from "@/composables/useStations/useStations";

const { soundEnabled, toggleSoundEnabled } = useTone();
const { selectedCity, selectableCities } = useStations();
</script>
<template>
  <div class="px-5 pb-2 text-center text-sm">
    an audio visual representation of city bike share programs
  </div>
  <div class="form-control px-7">
    <label class="label cursor-pointer px-3">
      <span class="label-text">enable sound</span>
      <input
        id="soundEnabled"
        type="checkbox"
        class="toggle toggle-sm"
        :checked="soundEnabled"
        @click="toggleSoundEnabled"
      />
    </label>
    <select id="selectedCity" v-model="selectedCity" class="select select-sm w-full">
      <option v-for="city in selectableCities" :key="city.city" :value="city">
        {{ city.city }}
      </option>
    </select>
  </div>
</template>
