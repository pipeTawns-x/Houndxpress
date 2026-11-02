import { lazy, Suspense } from "react";
import { Outlet, Route, Routes } from "react-router";
import { Layout } from "./components/layout/Layout.tsx";
import { RequireStaff } from "./components/panel/RequireStaff.tsx";
import { TransitionLinks } from "./components/layout/TransitionLinks.tsx";
import { env, IS_DEVELOPMENT } from "./config/env.ts";
import About from "./pages/About.tsx";
import Access from "./pages/Access.tsx";
import Contact from "./pages/Contact.tsx";
import Coverage from "./pages/Coverage.tsx";
import Faq from "./pages/Faq.tsx";
import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import Services from "./pages/Services.tsx";
import Tracking from "./pages/Tracking.tsx";
const Panel = lazy(() => import("./pages/Panel.tsx"));
const PanelRegistry = lazy(() => import("./pages/PanelRegistry.tsx"));
const PanelCreate = lazy(() => import("./pages/PanelCreate.tsx"));
const PanelArchive = lazy(() => import("./pages/PanelArchive.tsx"));
const GuideDetail = lazy(() => import("./pages/GuideDetail.tsx"));
// La ruta de desarrollo no debe generar un chunk público en la compilación.
const designModule = "./pages/Designs.tsx";
const Designs = IS_DEVELOPMENT ? lazy(() => import(/* @vite-ignore */ designModule)) : null;

export function App() {
  return (
    <TransitionLinks>
      <Suspense
        fallback={
          <p role="status" className="page-loading">
            Cargando…
          </p>
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="rastreo" element={<Tracking />} />
            <Route path="servicios" element={<Services />} />
            <Route path="cobertura" element={<Coverage />} />
            <Route path="nosotros" element={<About />} />
            <Route path="preguntas" element={<Faq />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="acceso" element={<Access />} />
            {env.isDevelopment && Designs ? <Route path="disenos" element={<Designs />} /> : null}
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="panel"
            element={
              <RequireStaff>
                <Outlet />
              </RequireStaff>
            }
          >
            <Route index element={<Panel />} />
            <Route path="registro" element={<PanelRegistry />} />
            <Route path="alta" element={<PanelCreate />} />
            <Route path="archivo" element={<PanelArchive />} />
            <Route path="guias/:trackingNumber" element={<GuideDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </TransitionLinks>
  );
}
