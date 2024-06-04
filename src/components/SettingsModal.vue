<script setup lang="ts">
import { ref } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// const allowAudio = ref(false);
const viewAbout = ref(true);
const dialog = ref<HTMLDialogElement>();

const emit = defineEmits(["show", "close"]);

defineExpose({
  show: () => show(),
  close: () => close(),
});

const show = () => {
  dialog.value?.showModal();
  emit("show");
};

const close = () => {
  dialog.value?.close();
  viewAbout.value = true;
  emit("close");
};
</script>

<template>
  <dialog class="modal" ref="dialog">
    <div class="modal-box bg-gray-700 text-white w-80">
      <!-- corner buttons -->
      <!-- <button
        @click="viewAbout = !viewAbout"
        class="btn btn-circle btn-ghost btn-sm absolute left-1 top-1"
      >
        <QuestionMarkCircleIcon class="h-5 w-5" />
      </button> -->
      <button
        @click="close"
        class="btn btn-circle btn-ghost btn-sm absolute right-1 top-1"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
      <!-- header -->
      <div class="text-center">
        <div class="text-lg">rita</div>
        <div class="text-sm py-2">
          an a/v representation of bike share programs
        </div>
      </div>
      <!-- settings -->
      <div v-show="!viewAbout">
        <div>
          <select class="select select-sm w-full max-w-xs">
            <option disabled>city select</option>
            <option selected>washington, dc</option>
            <option>boston</option>
            <option>cleveland</option>
            <option>new york city</option>
          </select>
        </div>
      </div>
      <!-- about -->
      <div v-show="viewAbout">
        <p class="text-center">
          Bike rental stations in the area are mapped onto a grid. The y-axis
          corresponds to each note in the C major scale, while the x-axis
          represents the octaves of these notes. When a bike is checked out or
          returned, the note associated with the station is played.
        </p>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button @click="close"></button>
    </form>
  </dialog>
</template>
