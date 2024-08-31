<script setup lang="ts">
import { useTone } from "@/composables/useTone/useTone";
const { soundEnabled, toggleSoundEnabled } = useTone();
</script>
<template>
  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Play Sound</span>
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
