import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,vue,ts}", "./**/*.{html,js, vue, ts}"],
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
    themes: [],
    logs: false,
  },
} satisfies Config;
