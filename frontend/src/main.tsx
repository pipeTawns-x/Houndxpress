import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { App } from "./App.tsx";
import { guideRepository } from "./services/index.ts";
import { createAppStore } from "./store/index.ts";

const root = document.getElementById("root");
if (!root) {
  throw new Error("No se encontró el elemento #root.");
}

// El almacén de Redux guarda las guías de toda la aplicación y lee y escribe a través del repositorio
// (demo o API, según VITE_DATA_SOURCE).
const store = createAppStore(guideRepository);

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
