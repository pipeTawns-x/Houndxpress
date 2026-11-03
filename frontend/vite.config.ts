import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Django corre en :8000 durante el desarrollo. Con este proxy el navegador
// habla siempre con el mismo origen y no hace falta configurar CORS.
const DJANGO = "http://127.0.0.1:8000";

const proxy = {
  "/api": DJANGO,
  "/admin": DJANGO,
  "/static": DJANGO,
};

export default defineConfig({
  plugins: [react()],
  // La CSP de nginx solo permite fuentes del propio origen, así que ningún recurso se incrusta.
  build: { assetsInlineLimit: 0 },
  server: { proxy },
  preview: { proxy },
});
