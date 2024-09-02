import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  plugins: [
    vue(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    }),
  ],
  build: {
    minify: "terser",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
