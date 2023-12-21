<script setup lang="ts">
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";

const emit = defineEmits(["close"]);
const viewAbout = ref(false);

const close = (): void => {
  viewAbout.value = false;
  emit("close");
};
</script>

<template>
  <!-- dark background -->
  <div
    @click.self="close"
    class="fixed z-40 left-0 top-0 bg-black bg-opacity-50 w-screen h-screen flex justify-center items-center"
  >
    <!-- modal -->
    <div class="bg-gray-700 text-white rounded-md p-2 w-72 flex-row">
      <!-- header buttons -->
      <div class="flex justify-between">
        <button
          @click="viewAbout = !viewAbout"
          class="rounded-md focus:outline-none focus:bg-gray-700 hover:bg-gray-600"
        >
          <QuestionMarkCircleIcon class="w-5 h-5" />
        </button>
        <button
          @click="close"
          class="rounded-md focus:outline-none focus:bg-gray-700 hover:bg-gray-600"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      <!-- header -->
      <div>
        <div class="text-center text-lg">rita</div>
        <div class="text-center text-xs">
          an a/v representation of bike share programs
        </div>
      </div>

      <!-- settings -->
      <div v-show="!viewAbout" class="p-4">
        <label class="form-control w-full max-w-xs">
          <div class="label">
            <span class="label-text">city select</span>
          </div>
          <select class="select select-sm">
            <option>washington dc</option>
            <option>new york city</option>
            <option>bay area</option>
            <option>cleveland</option>
            <option>denver</option>
          </select>
        </label>
      </div>
      <!-- about -->
      <div v-show="viewAbout" class="p-4">
        <div class="text-center text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci
          dolores culpa reprehenderit blanditiis nihil nobis?
        </div>
      </div>
    </div>
  </div>
</template>
