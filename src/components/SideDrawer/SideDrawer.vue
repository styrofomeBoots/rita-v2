<script setup lang="ts">
import { ref, watch } from "vue";
import { palette, rgba } from "@/palette";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import RitaIcon from "./RitaIcon.vue";
import StationNotification from "./StationNotification.vue";
import SettingsModal from "@/components/SettingsModal/SettingsModal.vue";
import { useStations } from "@/composables/useStations/useStations";

const showMenu = ref(false);
const shouldAnimate = ref(false); // keeps animation from popping off on page load
const modal = ref<InstanceType<typeof SettingsModal>>();
const { stationUpdates, stationUpdate, feedError, hotSpot } = useStations();

// with the drawer closed, rita's face glows a little with each update,
// in the same color the map uses for it
const glowKey = ref(0);
const glowColor = ref("transparent");
watch(stationUpdate, update => {
  if (!update || showMenu.value) return;
  const isTruck = !update.isSynthetic && Math.abs(update.bikesDelta) >= 5;
  const rgb = isTruck
    ? palette.hot
    : update.bikesDelta > 0
      ? palette.in
      : palette.out;
  glowColor.value = rgba(rgb, update.isSynthetic ? 0.45 : 0.9);
  glowKey.value++;
});

const showModal = (): void => {
  modal.value?.show();
};

const toggleDrawer = (): void => {
  shouldAnimate.value = true;
  showMenu.value = !showMenu.value;
};
</script>
<!-- daisy .btn class messes with the cog animation. -->
<template>
  <div
    class="pointer-events-none absolute inset-y-0 z-40 w-64 -translate-x-52 overflow-hidden pl-3 pt-3 transition delay-300 duration-300 ease-in-out"
    :class="{
      'translate-x-0': showMenu,
    }"
  >
    <div class="flex justify-end">
      <button
        class="btn-circle btn-sm pointer-events-auto absolute z-40 inline-flex items-center justify-center"
        :class="{
          '-translate-x-10 translate-y-0 animate-cog-slide-open': showMenu,
          'translate-y-10': !showMenu,
          'animate-cog-slide-close': !showMenu && shouldAnimate,
        }"
        @click="showModal"
      >
        <Cog6ToothIcon class="size-6" />
      </button>
      <button
        class="btn-circle btn-sm pointer-events-auto absolute z-40 inline-flex items-center justify-center"
        @click="toggleDrawer"
      >
        <span
          :key="glowKey"
          class="inline-flex"
          :class="{ 'rita-glow': glowKey > 0 && !showMenu }"
          :style="{ '--glow': glowColor }"
        >
          <RitaIcon class="size-7" />
        </span>
      </button>
    </div>
    <div
      class="mask-fade -ml-3 -mt-3 h-[calc(100%+0.75rem)] bg-gradient-to-r from-base-100/90 via-base-100/75 to-transparent pl-3 opacity-0 transition delay-200 duration-500 ease-in-out"
      :class="{ 'opacity-90': showMenu }"
    >
      <div class="pt-12">
        <Transition
          enter-from-class="opacity-0 -translate-y-2"
          enter-active-class="transition-all duration-700"
          leave-active-class="transition-opacity duration-700"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <div
            v-if="hotSpot"
            :key="hotSpot"
            class="flex items-center gap-2 pb-2 pl-1 text-xs text-activity-hot"
          >
            <span class="relative flex size-2">
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-activity-hot opacity-50"
              ></span>
              <span
                class="relative inline-flex size-2 rounded-full bg-activity-hot"
              ></span>
            </span>
            <span class="line-clamp-1">busy around {{ hotSpot }}</span>
          </div>
        </Transition>
        <transition-group
          tag="div"
          class="flex flex-col gap-1"
          enter-from-class="opacity-0 -translate-y-5"
          enter-active-class="transition-all duration-500 delay-150"
          enter-to-class="opacity-100 translate-y-0"
          move-class="transition-transform duration-500"
        >
          <StationNotification
            v-for="update in stationUpdates"
            :key="update.id"
            :name="update.name"
            :bikes-delta="update.bikesDelta"
            :is-synthetic="update.isSynthetic"
          />
          <div
            key="emptyState"
            class="flex gap-2"
            :class="{
              'opacity-0 transition duration-300 ease-in-out':
                stationUpdates.length > 0,
            }"
          >
            <template v-if="feedError">
              <span>this city's feed isn't answering. try another one?</span>
            </template>
            <template v-else>
              <span class="loading loading-ring loading-md"></span>
              <span>waiting for action</span>
            </template>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <SettingsModal ref="modal" />
  </Teleport>
</template>
<style scoped>
.rita-glow {
  animation: rita-glow 1.8s ease-out;
}
@keyframes rita-glow {
  0% {
    filter: drop-shadow(0 0 0 transparent);
  }
  20% {
    filter: drop-shadow(0 0 5px var(--glow)) drop-shadow(0 0 2px var(--glow));
  }
  100% {
    filter: drop-shadow(0 0 0 transparent);
  }
}
.mask-fade {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, transparent 100%);
}
</style>
