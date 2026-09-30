import { summarizeGuides } from "../../domain/index.ts";
import type { Guide, StageCode } from "../../domain/index.ts";
import { bem } from "../../lib/bem.ts";
import { StatCard } from "../ui/StatCard.tsx";

/** Modificador BEM del color de cada etapa (`stage-summary__segment--received`, etc.). */
const STAGE_TONES: Record<StageCode, string> = {
  cargo_received: "received",
  vehicle_loaded: "loaded",
  vehicle_released: "released",
  vehicle_in_transit: "in-transit",
  cargo_delivered: "delivered",
};

/** Resumen del panel: total, en tránsito (etapas 1 a 4), entregadas y distribución por etapa. */
export function StageSummary({ guides }: { guides: readonly Guide[] }) {
  const { total, delivered, byStage: counts } = summarizeGuides(guides);

  return (
    <section aria-labelledby="resumen" className="stage-summary">
      <h2 id="resumen" className="stage-summary__title">
        Resumen
      </h2>
      <div className="stage-summary__stats">
        <StatCard value={String(total)} label="Guías en total" />
        <StatCard value={String(total - delivered)} label="En tránsito" description="Etapas 1 a 4" />
        <StatCard value={String(delivered)} label="Entregadas" description="Etapa 5" />
      </div>

      <div className="stage-summary__distribution">
        <h3 className="stage-summary__distribution-title">Distribución por etapa</h3>
        <div aria-hidden="true" className="stage-summary__bar">
          {counts.map(({ stage, count }) =>
            count > 0 ? (
              <span
                key={stage.code}
                className={bem("stage-summary__segment", STAGE_TONES[stage.code])}
                style={{ width: `${String((count / total) * 100)}%` }}
              />
            ) : null,
          )}
        </div>
        <ul className="stage-summary__legend">
          {counts.map(({ stage, count }) => (
            <li key={stage.code} className="stage-summary__legend-item">
              <span aria-hidden="true" className={bem("stage-summary__swatch", STAGE_TONES[stage.code])} />
              <span>
                {stage.label}: <strong className="stage-summary__count">{count}</strong>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
