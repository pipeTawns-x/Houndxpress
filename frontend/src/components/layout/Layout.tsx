import { Suspense, useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ApiHealthContext } from "../../hooks/apiHealthContext.ts";
import { useApiHealth } from "../../hooks/useApiHealth.ts";
import { useMediaQuery } from "../../hooks/useMediaQuery.ts";
import { useScrollLock } from "../../hooks/useScrollLock.ts";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";
import { RouteEffects } from "./RouteEffects.tsx";

function PageLoading() {
  return (
    <div role="status" className="page-loading">
      Cargando…
    </div>
  );
}

/** Estructura común de todas las páginas: enlace para saltar, encabezado, contenido y pie. */
export function Layout() {
  const { pathname } = useLocation();
  const apiHealth = useApiHealth();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // El menú recuerda en qué ruta se abrió: al navegar deja de estar abierto sin necesitar un efecto.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt === pathname && !isDesktop;
  useScrollLock(menuOpen);

  const toggleMenu = useCallback(() => {
    setOpenedAt((current) => (current === pathname ? null : pathname));
  }, [pathname]);
  const closeMenu = useCallback(() => {
    setOpenedAt(null);
  }, []);

  return (
    <ApiHealthContext.Provider value={apiHealth}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header menuOpen={menuOpen} onMenuToggle={toggleMenu} onMenuClose={closeMenu} />
      <main id="contenido" tabIndex={-1} inert={menuOpen} className="site-main">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer inert={menuOpen} />
      <RouteEffects />
    </ApiHealthContext.Provider>
  );
}
