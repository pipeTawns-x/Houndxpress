import { useContext } from "react";
import { ApiHealthContext } from "../../hooks/apiHealthContext.ts";
import type { ApiHealthStatus } from "../../hooks/useApiHealth.ts";

const COPY: Record<ApiHealthStatus, { text: string; dot: string }> = {
  checking: { text: "Comprobando API…", dot: "bg-navy-300 animate-pulse" },
  online: { text: "API en línea · BD ok", dot: "bg-success" },
  offline: { text: "API sin conexión", dot: "bg-danger" },
};

const DARK_DOT: Partial<Record<ApiHealthStatus, string>> = {
  online: "bg-aqua-500",
  offline: "bg-danger",
};

/**
 * Punto y texto con el estado de `/api/v1/health/`. Lee el estado compartido
 * por el diseño de página; `status` permite forzarlo (guía de estilo, pruebas).
 */
export function ApiStatus({ status, tone = "light" }: { status?: ApiHealthStatus; tone?: "light" | "dark" }) {
  const shared = useContext(ApiHealthContext);
  const current = status ?? shared;
  const dark = tone === "dark";
  const copy = COPY[current];
  const dot = dark ? (DARK_DOT[current] ?? copy.dot) : copy.dot;
  return (
    <p
      role="status"
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-label font-medium",
        dark ? "bg-navy-900 text-navy-300 ring-1 ring-navy-700" : "bg-white text-ink ring-1 ring-line",
      ].join(" ")}
    >
      <span className={["size-2.5 rounded-full", dot].join(" ")} aria-hidden="true" />
      {copy.text}
    </p>
  );
}
