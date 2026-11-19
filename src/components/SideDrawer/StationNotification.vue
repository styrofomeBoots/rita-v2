<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  name: { type: String, required: true },
  bikesDelta: { type: Number, required: true },
  isSynthetic: { type: Boolean, required: true },
});

// real jumps this big are almost always the rebalancing van
const isTruck = computed(
  () => !props.isSynthetic && Math.abs(props.bikesDelta) >= 5
);

const update = computed(() => {
  const bikesAbs = Math.abs(props.bikesDelta);
  const bikeWord = bikesAbs === 1 ? "bike" : "bikes";
  const truck = isTruck.value ? " (probably a truck)" : "";
  if (props.bikesDelta < 0) {
    return `${bikesAbs} ${bikeWord} checked out${truck}`;
  }
  return `${bikesAbs} ${bikeWord} returned${truck}`;
});

// slate for bikes leaving, sand for bikes arriving, ember for trucks
const accent = computed(() => {
  if (isTruck.value)
    return { border: "border-activity-hot", text: "text-activity-hot" };
  if (props.bikesDelta > 0)
    return { border: "border-activity-in", text: "text-activity-in" };
  return { border: "border-activity-out", text: "text-activity-out" };
});
</script>
<template>
  <div
    class="border-l-2 py-1 pl-2 pr-1 transition-opacity"
    :class="[accent.border, props.isSynthetic ? 'border-dashed opacity-60' : '']"
  >
    <div class="line-clamp-2 text-sm font-medium">{{ props.name }}</div>
    <div class="text-xs text-base-content/60">{{ update }}</div>
  </div>
</template>
