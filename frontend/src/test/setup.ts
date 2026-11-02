import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { scrollToMock } from "./mocks.ts";
import { stubGlobal, unstubAllGlobals } from "./stubGlobal.ts";

beforeEach(() => {
  // Ninguna prueba toca la red: el estado de la API responde "sin conexión" salvo que la prueba diga otra cosa.
  stubGlobal(
    "fetch",
    jest.fn(() => Promise.reject(new TypeError("Sin red en las pruebas"))),
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
  // Devuelve `fetch`, `matchMedia` y demás globales sustituidos a su valor original.
  unstubAllGlobals();
});
