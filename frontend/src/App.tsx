import { lazy } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "./components/layout/Layout.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Coverage from "./pages/Coverage.tsx";
import Faq from "./pages/Faq.tsx";
import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import Services from "./pages/Services.tsx";
import Tracking from "./pages/Tracking.tsx";

// El panel y el índice de diseños se descargan solo cuando alguien los abre.
const Panel = lazy(() => import("./pages/Panel.tsx"));
const Designs = lazy(() => import("./pages/Designs.tsx"));

/** Rutas de la aplicación. El enrutador (BrowserRouter o MemoryRouter) lo pone quien la monta. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rastreo" element={<Tracking />} />
        <Route path="servicios" element={<Services />} />
        <Route path="cobertura" element={<Coverage />} />
        <Route path="nosotros" element={<About />} />
        <Route path="preguntas" element={<Faq />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="panel" element={<Panel />} />
        <Route path="disenos" element={<Designs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
