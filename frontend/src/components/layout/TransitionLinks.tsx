import { useEffect } from "react";
import { RouteEffects } from "./RouteEffects.tsx";
import type { ReactNode, MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { transitionRoute } from "../../lib/routeTransition.ts";

export function TransitionLinks({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => { document.documentElement.dataset.surface = pathname.startsWith("/panel") ? "panel" : "public"; }, [pathname]);
  function capture(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !document.startViewTransition)
      return;
    event.preventDefault();
    transitionRoute(() => {
      void navigate(`${url.pathname}${url.search}${url.hash}`);
    });
  }
  return (
    <div className="route-surface" onClickCapture={capture}>
      {children}
      <RouteEffects />
    </div>
  );
}
