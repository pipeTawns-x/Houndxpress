import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { scrollToMock } from "./mocks.ts";

beforeEach(() => {
  // Ninguna prueba toca la red: el estado de la API responde "sin conexión" salvo que la prueba diga otra cosa.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new TypeError("Sin red en las pruebas"))),
  );
  // jsdom no implementa desplazamiento; la aplicación lo llama al cambiar de ruta.
  scrollToMock.mockClear();
  window.scrollTo = scrollToMock as typeof window.scrollTo;
  try {
    window.localStorage.clear();
  } catch {
    // Sin almacenamiento no hay nada que limpiar.
  }
});

afterEach(() => {
  cleanup();
});
