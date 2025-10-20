// Flat ESLint config for ESLint v9+
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      // TS handles globals and types; disable noisy base rule for TS files
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": ["error", { singleQuote: false, semi: true, printWidth: 100 }],
    },
  },
];


