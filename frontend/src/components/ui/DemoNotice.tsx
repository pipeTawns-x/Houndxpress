import type { ReactNode } from "react";
import { Link } from "react-router";
import { TriangleAlert } from "lucide-react";
import { formatGuideNumber } from "../../domain/index.ts";
import { DEMO_GUIDE_NUMBERS, DEMO_GUIDE_ROUTES } from "../../services/demoData.ts";
import { isDemoData } from "../../services/index.ts";

/**
 * Aviso de que las guías son de demostración y se guardan solo en este
 * navegador, con la lista de guías de ejemplo para probar. No se muestra
 * cuando la aplicación usa la API (`VITE_DATA_SOURCE=api`).
 */
export function DemoNotice({
  showExamples = true,
  children,
  className,
  demo = isDemoData,
}: {
  showExamples?: boolean;
  /** Acciones que acompañan al aviso (por ejemplo, restablecer datos). */
  children?: ReactNode;
  className?: string;
  /** Solo para pruebas y para la guía de estilo. */
  demo?: boolean;
}) {
  if (!demo) return null;
  return (
    <aside
      aria-label="Aviso de datos de demostración"
      className={["rounded-2xl border border-warning/30 bg-warning-soft p-4 md:p-5", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-base text-ink">
              <strong className="font-semibold text-warning">Datos de demostración:</strong> se guardan solo en este
              navegador. No son guías reales de Hound Express.
            </p>
            {showExamples ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-label font-semibold text-ink">Guías de ejemplo para probar</p>
                <ul className="flex flex-wrap gap-2">
                  {DEMO_GUIDE_NUMBERS.map((number) => (
                    <li key={number}>
                      <Link
                        to={`/rastreo?guia=${number}`}
                        title={DEMO_GUIDE_ROUTES[number]}
                        className="inline-flex rounded-lg bg-white px-2.5 py-1 font-semibold text-label text-navy-800 tabular-nums ring-1 ring-warning/30 transition-colors hover:bg-aqua-100"
                      >
                        {formatGuideNumber(number)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </aside>
  );
}
