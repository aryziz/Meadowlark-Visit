import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: 2018,
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  pluginJs.configs.recommended,
];
