<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  name: { type: String, required: true },
  bikesDelta: { type: Number, required: true },
});

const update = computed(() => {
  const bikesAbs = Math.abs(props.bikesDelta);
  const bikeWord = bikesAbs === 1 ? "bike" : "bikes";
  if (props.bikesDelta < 0) {
    return `${bikesAbs} ${bikeWord} returned to station`;
  }
  return `${bikesAbs} ${bikeWord} checked out from station`;
});
</script>
<template>
  <div class="flex-col p-1">
    <div class="line-clamp-2 text-sm font-medium">{{ props.name }}</div>
    <div class="text-xs">{{ update }}</div>
  </div>
</template>
