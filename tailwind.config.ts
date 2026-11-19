/* eslint-disable @typescript-eslint/no-var-requires */
import type { Config } from "tailwindcss";
import { hex, palette } from "./src/palette";

export default {
  content: ["./src/**/*.{astro,html,svelte,vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        activity: {
          out: hex(palette.out),
          in: hex(palette.in),
          hot: hex(palette.hot),
        },
        rita: {
          "50": "#f5f5f5",
          "100": "#e8e8e8",
          "200": "#d1d1d1",
          "300": "#b0b0b0",
          "400": "#878787",
          "500": "#7a7a7a",
          "600": "#5c5c5c",
          "700": "#4f4f4f",
          "800": "#454545",
          "900": "#3d3d3d",
          "950": "#262626",
        },
      },
      keyframes: {
        "cog-slide-open": {
          "0%": {
            transform: "translateY(3rem)",
            opacity: "1",
          },
          "50%": {
            transform: "translateY(0)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(-3rem) translateY(0)",
            opacity: "1",
          },
        },
        "cog-slide-close": {
          "0%": {
            transform: "translateX(-3rem) translateY(0)",
            opacity: "1",
          },
          "50%": {
            transform: "translateY(0)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(3rem)",
            opacity: "1",
          },
        },
      },
      animation: {
        "cog-slide-open": "cog-slide-open 600ms ease-in-out",
        "cog-slide-close": "cog-slide-close 600ms ease-in-out",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        rita: {
          ...require("daisyui/src/theming/themes")["forest"],
          primary: "#e2c290",
          "primary-content": "#1a1714",
          secondary: "#9fb4c7",
          accent: "#e07a3f",
          neutral: "#2a2724",
          "base-100": "#161514",
          "base-200": "#1e1c1a",
          "base-300": "#2a2724",
          "base-content": "#ece6dc",
          ".btn:focus-visible": {
            outline: "none",
          },
          ".select:focus": {
            outline: "none",
            border: "none",
          },
        },
      },
    ],
    logs: false,
  },
} satisfies Config;
