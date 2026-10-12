import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * Al cambiar de ruta: vuelve al inicio de la página y mueve el foco a
 * `<main>` para que teclado y lectores de pantalla empiecen en el contenido
 * nuevo. Si la dirección trae `#ancla`, se desplaza a ese elemento. No
 * reacciona a los parámetros de búsqueda (`?guia=`).
 */
export function RouteEffects() {
  const { pathname, hash } = useLocation();
  const previous = useRef({ pathname, hash });

  useEffect(() => {
    const before = previous.current;
    if (before.pathname === pathname && before.hash === hash) return;
    previous.current = { pathname, hash };

    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView?.();
        return;
      }
    }
    if (before.pathname !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.getElementById("contenido")?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return null;
}
