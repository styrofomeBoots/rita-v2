<script setup lang="ts">
import { ref } from "vue";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import RitaIcon from "./RitaIcon.vue";
import StationNotification from "./StationNotification.vue";
import SettingsModal from "@/components/SettingsModal/SettingsModal.vue";
import { useStations } from "@/composables/useStations/useStations";

const showMenu = ref(false);
const shouldAnimate = ref(false); // keeps animation from popping off on page load
const modal = ref<InstanceType<typeof SettingsModal>>();
const { stationUpdates } = useStations();

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
        <RitaIcon class="size-7" />
      </button>
    </div>
    <div
      class="mask-fade h-full opacity-0 transition delay-200 duration-500 ease-in-out"
      :class="{ 'opacity-90': showMenu }"
    >
      <transition-group
        tag="div"
        class="flex flex-col gap-1 pt-9"
        enter-from-class="opacity-0 -translate-y-5"
        enter-active-class="transition-all duration-500 delay-150"
        enter-to-class="opacity-100 translate-y-0"
        move-class="transition-transform duration-500"
      >
        <StationNotification
          v-for="update in stationUpdates"
          :key="update.name"
          :name="update.name"
          :bikes-delta="update.bikesDelta"
        />
        <div
          key="emptyState"
          class="flex gap-2"
          :class="{
            'opacity-0 transition duration-300 ease-in-out':
              stationUpdates.length > 0,
          }"
        >
          <span class="loading loading-ring loading-md"></span>
          <span>waiting for action</span>
        </div>
      </transition-group>
    </div>
  </div>
  <Teleport to="body">
    <SettingsModal ref="modal" />
  </Teleport>
</template>
<style scoped>
.mask-fade {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 70%, transparent 100%);
}
</style>
