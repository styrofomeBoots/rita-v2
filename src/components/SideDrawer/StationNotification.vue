<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  name: { type: String, required: true },
  bikesDelta: { type: Number, required: true },
  isSynthetic: { type: Boolean, required: true },
});

const update = computed(() => {
  const bikesAbs = Math.abs(props.bikesDelta);
  const bikeWord = bikesAbs === 1 ? "bike" : "bikes";
  if (props.bikesDelta < 0) {
    return `${bikesAbs} ${bikeWord} checked out from station`;
  }
  return `${bikesAbs} ${bikeWord} returned to station`;
});
</script>
<template>
  <div
    class="flex-col rounded-md p-1 transition-colors"
    :class="props.isSynthetic ? 'text-[#8f7a5a]' : 'text-base-content'"
  >
    <div class="line-clamp-2 text-sm font-medium">{{ props.name }}</div>
    <div class="text-xs">{{ update }}</div>
  </div>
</template>
