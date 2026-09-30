import { useContext } from "react";
import { ApiHealthContext } from "../../hooks/apiHealthContext.ts";
import type { ApiHealthStatus } from "../../hooks/useApiHealth.ts";
import { bem } from "../../lib/bem.ts";

const COPY: Record<ApiHealthStatus, string> = {
  checking: "Comprobando API…",
  online: "API en línea · BD ok",
  offline: "API sin conexión",
};

/**
 * Punto y texto con el estado de `/api/v1/health/`. Lee el estado compartido
 * por el diseño de página; `status` permite forzarlo (guía de estilo, pruebas).
 */
export function ApiStatus({ status, tone = "light" }: { status?: ApiHealthStatus; tone?: "light" | "dark" }) {
  const shared = useContext(ApiHealthContext);
  const current = status ?? shared;
  return (
    <p role="status" className={bem("api-status", { dark: tone === "dark" })}>
      <span className={bem("api-status__dot", current)} aria-hidden="true" />
      {COPY[current]}
    </p>
  );
}
