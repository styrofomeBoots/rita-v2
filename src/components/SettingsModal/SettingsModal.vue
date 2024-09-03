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
      class="h- modal-box overflow-hidden p-2 transition-all"
      :class="showAbout ? 'h-[22rem] w-96' : 'h-56 w-80'"
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
      <div
        :class="
          !showAbout
            ? ' py-1 opacity-100 transition-opacity delay-150 duration-500'
            : 'py-0 opacity-0'
        "
      >
        <SettingsSection v-if="!showAbout" />
      </div>
      <div
        class=""
        :class="
          showAbout
            ? ' py-1 opacity-100 transition-opacity delay-150 duration-500'
            : 'h-0 py-0 opacity-0'
        "
      >
        <AboutSection v-if="showAbout" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="close"></button>
    </form>
  </dialog>
</template>
