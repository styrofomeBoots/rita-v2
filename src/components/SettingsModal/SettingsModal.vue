<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  XMarkIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";
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
  dialog.value?.showModal();
  emit("show");
};

const close = (): void => {
  dialog.value?.close();
  emit("close");
  showAbout.value = false;
};

onMounted(() => show());
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div
      class="modal-box flex flex-col p-2 transition-all delay-300"
      :class="showAbout ? 'h-[23rem] w-96' : 'h-56 w-80'"
    >
      <div class="flex justify-between">
        <button
          class="btn btn-circle btn-ghost swap swap-rotate btn-sm"
          :class="{ 'swap-active': showAbout }"
          @click="showAbout = !showAbout"
        >
          <QuestionMarkCircleIcon class="swap-off size-6" />
          <Cog6ToothIcon class="swap-on size-6" />
        </button>
        <button class="btn btn-circle btn-ghost btn-sm" @click="close">
          <XMarkIcon class="size-6" />
        </button>
      </div>
      <div class="text-center text-xl">rita</div>
      <Transition
        enter-from-class="opacity-0"
        enter-active-class="transition-opacity duration-300 delay-300"
        leave-active-class="transition-opacity duration-300"
        leave-to-class="opacity-0"
        mode="out-in"
        appear
      >
        <SettingsSection v-if="!showAbout" />
        <AboutSection v-else-if="showAbout" />
      </Transition>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="close"></button>
    </form>
  </dialog>
</template>
