import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,vue,ts}"],
  theme: {
    extend: {
      colors: {
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
        settingSlide: {
          "50%": { transform: "translate(3rem)" },
          "100%": { transform: "translate(3rem, 3rem)" },
        },
      },
      animation: { settingSlide: "settingSlide 1s ease-in-out" },
    },
  },
  plugins: [],
} satisfies Config;
