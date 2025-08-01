import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["node_modules", "public", "build", "dist", "coverage", "data"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["node_modules", "public", "build", "dist", "coverage"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  eslintConfigPrettier,
]);
