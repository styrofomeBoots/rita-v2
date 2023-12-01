<script setup lang="ts">
import { BugAntIcon } from "@heroicons/vue/24/outline";

import Notification from "./Notification.vue";

const props = defineProps({
  showMenu: { type: Boolean, required: true },
});
</script>
<template>
  <div
    class="bg-blue-800 text-blue-100 w-64 space-y-6 py-7 px-2 inset-y-0 left-0 transform absolute -translate-x-full transition duration-200 ease-in-out"
    :class="{ 'translate-x-0': props.showMenu }"
  >
    <!-- logo -->
    <a href="#" class="text-white flex items-center space-x-2 px-4">
      <BugAntIcon class="w-8 h-8" />
      <span class="text-2xl font-extrabold">rita</span>
    </a>
    <nav>
      <Notification />
      <Notification />
      <Notification />
    </nav>
  </div>
</template>
