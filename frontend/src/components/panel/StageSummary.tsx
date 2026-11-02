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
        <StatCard value={String(total - delivered)} label="Activas" description="Etapas 1 a 4" />
        <StatCard value={String(delivered)} label="Entregadas" description="Etapa 5" />
      </div>

      <div className="stage-summary__distribution">
        <h3 className="stage-summary__distribution-title">Distribución por etapa</h3>
        <ul className="stage-summary__legend">
          {counts.map(({ stage, count }) => (
            <li key={stage.code} className="stage-summary__legend-item">
              <meter className={bem("stage-summary__meter", STAGE_TONES[stage.code])} min={0} max={Math.max(total, 1)} value={count} aria-label={stage.label} />
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
