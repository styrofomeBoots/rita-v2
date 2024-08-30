/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "array",
      },
    ],
    "@typescript-eslint/brace-style": ["error", "1tbs"],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    "brace-style": "off",
    eqeqeq: "error",
    "no-console": "warn",
    "no-debugger": "warn",

    "vue/block-lang": [
      "error",
      {
        script: {
          lang: "ts",
        },
      },
    ],
    "vue/component-api-style": ["error", ["script-setup"]],
    "vue/define-macros-order": [
      "error",
      {
        order: ["defineProps", "defineEmits"],
      },
    ],
    "vue/eqeqeq": "error",
    "vue/match-component-file-name": [
      "error",
      {
        extensions: ["ts", "tsx", "vue"],
        shouldMatchCase: true,
      },
    ],
    "vue/no-empty-component-block": "error",
    "vue/prefer-true-attribute-shorthand": "error",
    "vue/require-macro-variable-name": [
      "error",
      {
        defineEmits: "emit",
        defineProps: "props",
        defineSlots: "slots",
        useAttrs: "attrs",
        useSlots: "slots",
      },
    ],
    "vue/require-name-property": "error",
    "vue/require-typed-ref": "error",
    "vue/v-for-delimiter-style": ["error", "in"],
  },
};
