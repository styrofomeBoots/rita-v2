<script setup lang="ts">
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { ref } from "vue";
import StationNotification from "./StationNotification.vue";
import SettingsModal from "./SettingsModal.vue";
import { useMapStore } from "@/stores/mapStore";

const showMenu = ref(false);
const shouldAnimate = ref(false); // keeps animation from popping off on page load
const modal = ref<InstanceType<typeof SettingsModal>>();
const { stationUpdates } = useMapStore();

const showModal = (): void => {
  modal.value?.show();
};

const toggleDrawer = (): void => {
  shouldAnimate.value = true;
  showMenu.value = !showMenu.value;
};

// daisy .btn class messes with the cog animation???
// using something crazy for now.
</script>

<template>
  <div
    class="absolute inset-y-0 z-40 w-64 -translate-x-52 overflow-hidden pl-3 pt-3 text-blue-100 transition delay-300 duration-300 ease-in-out"
    :class="{
      'translate-x-0': showMenu,
    }"
  >
    <div class="flex justify-end">
      <button
        class="btn-circle btn-ghost btn-sm absolute z-40 inline-flex items-center justify-center"
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
        class="btn-circle btn-ghost btn-sm absolute z-40 inline-flex items-center justify-center"
        @click="toggleDrawer"
      >
        <svg
          class="size-7"
          fill="currentcolor"
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
        >
          <path
            d="m14 58.4h3.5l10.7 34.5h-3.5zm18.1 4.7l5-7.7h3l5.1 7.7h-2.9l-3.7-5-3.7 5zm27.2 22.1q-4 3.8-8.1 3.8h-2.4v-3.8h1.9q2.2 0 3.6-0.8 1.2-0.7 2-1.5-2-1.8-3.4-3.6-0.6-0.8-0.6-1.7 0-0.7 0.3-1.5 0.3-1.1 2.4-2.2 1.9-0.9 4.3-0.9 2.4 0 4.3 0.9 2.1 1.1 2.4 2.2 0.3 0.8 0.3 1.5 0 0.9-0.6 1.7-1.6 2-3.4 3.6 0.6 0.6 2 1.5 1.3 0.8 3.6 0.8h1.9v3.8h-2.4q-4.1 0-8.1-3.8zm1.1-8.3q-0.6-0.1-1.1-0.1-0.5 0-1.2 0.1-0.9 0.3-0.9 0.9 0 0.6 2.1 2.6 2.1-2 2.1-2.6 0-0.6-1-0.9zm13-13.8l5-7.7h3l5.1 7.7h-2.9l-3.7-5-3.7 5zm17.1 29.8l10.6-34.5h3.5l-10.6 34.5z"
          />
          <path
            d="m19.8 27.4h4l11.2 11.4h-4.2l-9-8.1-9 8.1h-4.1zm75.2 0h4l11.2 11.4h-4.1l-9.1-8.1-9 8.1h-4.1z"
          />
        </svg>
      </button>
    </div>
    <div
      class="space-y-1 px-2 pt-10 opacity-0 transition delay-200 duration-500 ease-in-out"
      :class="{ 'opacity-100': showMenu }"
    >
      <StationNotification
        v-for="update in stationUpdates"
        :key="update.name"
        :name="update.name"
        :bikes-delta="update.bikesDelta"
      />
    </div>
  </div>
  <Teleport to="body">
    <SettingsModal ref="modal" />
  </Teleport>
</template>
