<script setup lang="ts">
import Notification from "./Notification.vue";

const props = defineProps({
  showMenu: { type: Boolean, required: true },
});
</script>
<template>
  <div
    class="bg-blue-800 text-blue-100 w-64 space-y-6 py-7 px-2 inset-y-0 left-0 transform absolute z-40 -translate-x-full transition duration-200 ease-in-out"
    :class="{ 'translate-x-0': props.showMenu }"
  >
    <!-- logo -->
    <a href="#" class="text-white flex items-center space-x-2 px-4">
      <svg
        class="h-9 w-9"
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
      <span class="text-2xl">rita</span>
    </a>
    <nav>
      <Notification />
      <Notification />
      <Notification />
    </nav>
  </div>
</template>
