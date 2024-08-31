<script setup lang="ts">
import { ref, onMounted } from "vue";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/vue/24/outline";
import AboutSection from "./AboutSection.vue";
import SettingsSection from "./SettingsSection.vue";

const emit = defineEmits(["show", "close"]);
defineExpose({
  show: () => show(),
  close: () => close(),
});

const showAbout = ref(false);
const dialog = ref<HTMLDialogElement>();

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
      <div class="text-center">
        <div class="text-xl">rita</div>
        <div class="py-1 text-sm">
          a/v representation of the dc bike share program
        </div>
      </div>
      <div v-show="!showAbout">
        <SettingsSection />
      </div>
      <div v-show="showAbout">
        <AboutSection />
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button @click="close"></button>
    </form>
  </dialog>
</template>
