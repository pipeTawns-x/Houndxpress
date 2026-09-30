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
  server: { proxy },
  preview: { proxy },
});
