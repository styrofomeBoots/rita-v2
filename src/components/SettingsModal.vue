<script setup lang="ts">
import { ref, onMounted } from "vue";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(["show", "close"]);
const showAbout = ref(false);
const dialog = ref<HTMLDialogElement>();
const playSound = ref(false);

defineExpose({
  show: () => show(),
  close: () => close(),
});

const show = (): void => {
  showAbout.value = false;
  dialog.value?.showModal();
  emit("show");
};

const close = (): void => {
  dialog.value?.close();
  emit("close");
};

onMounted(() => show());
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box w-80">
      <!-- corner buttons -->
      <button
        class="btn btn-circle btn-ghost btn-sm absolute left-1 top-1"
        @click="showAbout = !showAbout"
      >
        <QuestionMarkCircleIcon class="size-6" />
      </button>
      <button
        class="btn btn-circle btn-ghost btn-sm absolute right-1 top-1"
        @click="close"
      >
        <XMarkIcon class="size-6" />
      </button>
      <!-- header -->
      <div class="text-center">
        <div class="text-xl">rita</div>
        <div class="py-1 text-sm">
          a/v representation of the dc bike share program
        </div>
      </div>
      <!-- settings -->
      <div v-show="!showAbout">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Play Sound</span>
            <input
              id="playSound"
              type="checkbox"
              class="toggle"
              :checked="playSound"
            />
          </label>
        </div>
      </div>
      <!-- about -->
      <div v-show="showAbout">
        <p class="text-center">
          Bike rental stations in the area are mapped onto a grid. The y-axis
          corresponds to notes within the C major scale, while the x-axis represents
          the octaves of these notes. When a bike is checked out or returned, the
          note associated with the station is played.
        </p>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button @click="close"></button>
    </form>
  </dialog>
</template>
