import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

// tone.js cleans up every finished note in a requestIdleCallback. the map
// animates constantly, so the browser may never be idle and those cleanups
// pile up as leaked audio nodes. a timeout makes them run within 2 seconds.
const requestIdle = window.requestIdleCallback?.bind(window);
if (requestIdle) {
  window.requestIdleCallback = (callback, options): number =>
    requestIdle(callback, { timeout: 2000, ...options });
}

const app = createApp(App);

app.mount("#app");
