import type { ReactNode } from "react";
import { Link } from "react-router";
import { TriangleAlert } from "lucide-react";
import { formatGuideNumber } from "../../domain/index.ts";
import { cx } from "../../lib/bem.ts";
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
    <aside aria-label="Aviso de datos de demostración" className={cx("demo-notice", className)}>
      <div className="demo-notice__layout">
        <div className="demo-notice__main">
          <TriangleAlert className="demo-notice__icon" aria-hidden="true" />
          <div className="demo-notice__content">
            <p className="demo-notice__text">
              <strong className="demo-notice__title">Datos de demostración:</strong> se guardan solo en este
              navegador. No son guías reales de Hound Express.
            </p>
            {showExamples ? (
              <div className="demo-notice__examples">
                <p className="demo-notice__examples-title">Guías de ejemplo para probar</p>
                <ul className="demo-notice__list">
                  {DEMO_GUIDE_NUMBERS.map((number) => (
                    <li key={number}>
                      <Link
                        to={`/rastreo?guia=${number}`}
                        title={DEMO_GUIDE_ROUTES[number]}
                        className="demo-notice__link"
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
        {children ? <div className="demo-notice__actions">{children}</div> : null}
      </div>
    </aside>
  );
}
