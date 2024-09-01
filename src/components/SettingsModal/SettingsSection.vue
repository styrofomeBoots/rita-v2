<script setup lang="ts">
import { useTone } from "@/composables/useTone/useTone";
const { soundEnabled, toggleSoundEnabled } = useTone();
</script>
<template>
  <div class="px-5 pb-2 text-center text-sm">
    an audio/visual representation of the dc bike share program
  </div>
  <div class="form-control px-7">
    <label class="label cursor-pointer">
      <span class="">enable sound</span>
      <input
        id="soundEnabled"
        type="checkbox"
        class="toggle"
        :checked="soundEnabled"
        @click="toggleSoundEnabled"
      />
    </label>
  </div>
</template>
