import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "coverage"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // Las pruebas exportan utilidades y no componentes: Fast Refresh no aplica. Jest aporta describe, it, expect y jest.
    files: ["**/*.test.{ts,tsx}", "src/test/**"],
    languageOptions: { globals: globals.jest },
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    // Configuración de Jest y de Vite: se ejecuta en Node.
    files: ["**/*.js"],
    extends: [js.configs.recommended, tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  {
    // Los sustitutos que Jest carga con require (jest/*.cjs) son CommonJS.
    files: ["**/*.cjs"],
    extends: [js.configs.recommended, tseslint.configs.disableTypeChecked],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
  },
]);
