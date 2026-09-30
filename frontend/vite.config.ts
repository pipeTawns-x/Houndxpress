import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Django corre en :8000 durante el desarrollo. Con este proxy el navegador
// habla siempre con el mismo origen y no hace falta configurar CORS.
const DJANGO = "http://127.0.0.1:8000";

const proxy = {
  "/api": DJANGO,
  "/admin": DJANGO,
  "/static": DJANGO,
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Los estilos no se procesan en las pruebas, salvo los que se importan como texto (`?raw`) para revisarlos.
    css: { include: [/\?raw$/] },
    restoreMocks: true,
    unstubGlobals: true,
  },
});
